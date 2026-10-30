enum ObstacleKind { crate, hayBale, crateStack, tractor }

extension ObstacleKindX on ObstacleKind {
  bool get jumpable =>
      this == ObstacleKind.crate || this == ObstacleKind.hayBale;
}

class Obstacle {
  final int lane;
  double z; // meters ahead of the player
  final ObstacleKind kind;
  Obstacle({required this.lane, required this.z, required this.kind});
}

class Egg {
  final int lane;
  double z;
  final double height; // 0 = on ground, ~1.1 = must jump to collect
  bool taken = false;
  Egg({required this.lane, required this.z, required this.height});
}

class Feather {
  double x, y, vx, vy, rot, vr, life; // x/y normalized 0...1
  Feather({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.rot,
    required this.vr,
    required this.life,
  });
}

enum GameScreen { menu, playing, paused, gameOver }
