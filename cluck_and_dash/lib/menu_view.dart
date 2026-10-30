import 'package:flutter/material.dart';

import 'game_engine.dart';
import 'world_painter.dart';

class MenuView extends StatelessWidget {
  const MenuView({super.key, required this.engine});
  final GameEngine engine;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(child: WorldView(engine: engine)),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 40),
            child: Column(
              children: [
                const SizedBox(height: 60),
                const _Title(),
                const Spacer(),
                _bestCapsule(),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: engine.startRun,
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFFE04A32),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: const StadiumBorder(),
                      ),
                      icon: const Icon(Icons.play_arrow),
                      label: const Text(
                        'Start Run',
                        style: TextStyle(
                            fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _bestCapsule() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.25),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.emoji_events, color: Color(0xFFFFC53D)),
          const SizedBox(width: 10),
          Text('Best run  ',
              style: TextStyle(color: Colors.white.withOpacity(0.9))),
          Text('${engine.bestScore} pts',
              style: const TextStyle(
                  color: Colors.white, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _Title extends StatelessWidget {
  const _Title();

  @override
  Widget build(BuildContext context) {
    Widget line(String text, Color fill) {
      const style = TextStyle(
        fontSize: 58,
        fontWeight: FontWeight.w900,
        letterSpacing: 1,
      );
      return Stack(
        children: [
          Text(
            text,
            style: style.copyWith(
              foreground: Paint()
                ..style = PaintingStyle.stroke
                ..strokeWidth = 10
                ..color = const Color(0xFF5A3A22),
            ),
          ),
          Text(text, style: style.copyWith(color: fill)),
        ],
      );
    }

    return Column(
      children: [
        line('Cluck &', Colors.white),
        line('Dash', const Color(0xFFFFC53D)),
        const SizedBox(height: 10),
        Container(
          width: 130,
          height: 46,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: const Color(0xFF8A5A33),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF5A3A22), width: 3),
          ),
          child: const Text(
            '3D',
            style: TextStyle(
                fontSize: 30,
                fontWeight: FontWeight.w900,
                color: Colors.white),
          ),
        ),
      ],
    );
  }
}
