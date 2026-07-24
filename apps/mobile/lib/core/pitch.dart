// Mic pitch capture (flutter_audio_capture → Float32 PCM → pitch_detector_dart
// YIN) and shape-scoring for the "Your turn" maqām practice. We compare the
// SHAPE of the learner's melody to the reference (normalized + progress-aligned
// + correlation), so absolute pitch and octave don't matter — only the
// up-and-down journey.

import 'dart:async';
import 'dart:math';
import 'dart:typed_data';

import 'package:flutter_audio_capture/flutter_audio_capture.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:pitch_detector_dart/pitch_detector.dart';

const int _bufSize = 2048;
const int _sampleRate = 44100;

class PitchSession {
  final _capture = FlutterAudioCapture();
  final _detector = PitchDetector(audioSampleRate: _sampleRate * 1.0, bufferSize: _bufSize);
  final List<double> _buf = [];
  bool _running = false;

  /// Starts the mic; calls [onPitch] with each detected Hz. Returns null on
  /// success, or a user-facing message explaining why it couldn't start —
  /// distinguishing a denied permission from a mic that wouldn't open.
  Future<String?> start(void Function(double hz) onPitch) async {
    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      return 'Microphone access is needed for “Your turn”. Please allow it and try again.';
    }
    try {
      await _capture.start(
        (dynamic obj) async {
          final samples = obj as Float32List;
          _buf.addAll(samples);
          while (_buf.length >= _bufSize) {
            final window = _buf.sublist(0, _bufSize);
            _buf.removeRange(0, _bufSize);
            try {
              final res = await _detector.getPitchFromFloatBuffer(window);
              if (res.pitched && res.pitch >= 70 && res.pitch <= 700) onPitch(res.pitch);
            } catch (_) {/* skip bad window */}
          }
        },
        (Object e) {/* stream error — ignore, session just yields no pitch */},
        sampleRate: _sampleRate,
        bufferSize: _bufSize,
      );
    } catch (_) {
      return 'Couldn’t open the microphone. Close other apps that might be using it and try again.';
    }
    _running = true;
    return null;
  }

  Future<void> stop() async {
    if (!_running) return;
    _running = false;
    try {
      await _capture.stop();
    } catch (_) {}
    _buf.clear();
  }

  void dispose() {
    if (_running) _capture.stop();
  }
}

double _log2(double x) => log(x) / ln2;

/// Map a pitch in Hz to a 0..1 ribbon height over a plausible vocal range.
double pitchToLevel(double hz) {
  final lo = _log2(90), hi = _log2(520);
  return ((_log2(hz) - lo) / (hi - lo)).clamp(0.0, 1.0);
}

List<double> _resample(List<double> src, int n) {
  if (src.isEmpty) return List.filled(n, 0);
  if (src.length == 1) return List.filled(n, src.first);
  final out = <double>[];
  for (var i = 0; i < n; i++) {
    final t = i / (n - 1) * (src.length - 1);
    final lo = t.floor(), hi = min(src.length - 1, lo + 1);
    out.add(src[lo] + (src[hi] - src[lo]) * (t - lo));
  }
  return out;
}

List<double> _minMax(List<double> a) {
  final lo = a.reduce(min), hi = a.reduce(max);
  if (hi - lo < 1e-6) return a.map((_) => 0.5).toList();
  return a.map((v) => (v - lo) / (hi - lo)).toList();
}

double _pearson(List<double> a, List<double> b) {
  final n = min(a.length, b.length);
  var ma = 0.0, mb = 0.0;
  for (var i = 0; i < n; i++) {
    ma += a[i];
    mb += b[i];
  }
  ma /= n;
  mb /= n;
  var num = 0.0, da = 0.0, db = 0.0;
  for (var i = 0; i < n; i++) {
    final x = a[i] - ma, y = b[i] - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  if (da < 1e-9 || db < 1e-9) return 0;
  return num / sqrt(da * db);
}

/// How closely the learner's melodic SHAPE followed the reference (0..100).
int shapeMatch(List<double> userHz, List<double> refLevels) {
  if (userHz.length < 6) return 0;
  const n = 64;
  final user = _minMax(_resample(userHz.map(_log2).toList(), n));
  final ref = _resample(refLevels, n);
  return (max(0.0, _pearson(user, ref)) * 100).round();
}
