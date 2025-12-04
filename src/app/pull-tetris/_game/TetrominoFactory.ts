import Matter from 'matter-js';
import { BLOCK_SIZE, TETROMINO_COLORS, TetrominoType, CATEGORY_BLOCK, CATEGORY_CURRENT } from '../constants';

export class TetrominoFactory {
  static create(type: TetrominoType, x: number, y: number) {
    const parts: Matter.Body[] = [];
    const color = TETROMINO_COLORS[type];
    const options = {
      render: { fillStyle: color },
      friction: 0.5,
      restitution: 0.2,
      label: 'mino',
    };

    // Relative positions of minos based on 0,0 center
    // For 3x3 or 4x4 grids
    let definitions: { x: number; y: number }[] = [];

    switch (type) {
      case 'I': // 4x4
        definitions = [
          { x: -1.5, y: -0.5 }, { x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 1.5, y: -0.5 }
        ];
        break;
      case 'O': // 2x2
        definitions = [
          { x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 },
          { x: -0.5, y: 0.5 }, { x: 0.5, y: 0.5 }
        ];
        break;
      case 'T': // 3x3
        definitions = [
                         { x: 0, y: -1 },
          { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }
        ];
        break;
      case 'S': // 3x3
        definitions = [
                           { x: 0, y: -1 }, { x: 1, y: -1 },
          { x: -1, y: 0 }, { x: 0, y: 0 }
        ];
        break;
      case 'Z': // 3x3
        definitions = [
          { x: -1, y: -1 }, { x: 0, y: -1 },
                           { x: 0, y: 0 }, { x: 1, y: 0 }
        ];
        break;
      case 'J': // 3x3
        definitions = [
          { x: -1, y: -1 },
          { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }
        ];
        break;
      case 'L': // 3x3
        definitions = [
                                            { x: 1, y: -1 },
          { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }
        ];
        break;
    }

    // Convert relative grid coords to pixel offsets and create bodies
    definitions.forEach(def => {
      parts.push(Matter.Bodies.rectangle(
        x + def.x * BLOCK_SIZE,
        y + def.y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE,
        options
      ));
    });

    const compoundBody = Matter.Body.create({
      parts: parts,
      label: `tetromino-${type}`,
      collisionFilter: {
        category: CATEGORY_CURRENT
      }
    });

    // Apply collision filter to all parts ensuring they match the parent
    compoundBody.parts.forEach(part => {
        part.collisionFilter.category = CATEGORY_CURRENT;
    });

    return compoundBody;
  }
}

