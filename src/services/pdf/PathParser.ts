/**
 * SVG Path Parser Service
 * Parses SVG path 'd' attribute into individual commands
 */

/**
 * Supported path command types
 */
export type PathCommandType =
  | 'M' // moveto (absolute)
  | 'm' // moveto (relative)
  | 'L' // lineto (absolute)
  | 'l' // lineto (relative)
  | 'H' // horizontal lineto (absolute)
  | 'h' // horizontal lineto (relative)
  | 'V' // vertical lineto (absolute)
  | 'v' // vertical lineto (relative)
  | 'C' // curveto (absolute)
  | 'c' // curveto (relative)
  | 'S' // smooth curveto (absolute)
  | 's' // smooth curveto (relative)
  | 'Q' // quadratic bezier (absolute)
  | 'q' // quadratic bezier (relative)
  | 'T' // smooth quadratic (absolute)
  | 't' // smooth quadratic (relative)
  | 'A' // arc (absolute)
  | 'a' // arc (relative)
  | 'Z' // closepath
  | 'z'; // closepath

/**
 * Parsed path command
 */
export interface PathCommand {
  type: PathCommandType;
  /** End point X (for M, L, H, C, S, Q, T, A) */
  x?: number;
  /** End point Y (for M, L, V, C, S, Q, T, A) */
  y?: number;
  /** First control point X (for C, S) */
  x1?: number;
  /** First control point Y (for C, S) */
  y1?: number;
  /** Second control point X (for C, Q) */
  x2?: number;
  /** Second control point Y (for C, Q) */
  y2?: number;
  /** Arc parameters */
  rx?: number;
  ry?: number;
  rotation?: number;
  largeArc?: boolean;
  sweep?: boolean;
}

/**
 * Path parser for basic SVG path commands
 * Currently supports: M, L, H, V, Z (most common for sashiko patterns)
 */
export class PathParser {
  /**
   * Parse a path 'd' attribute into commands
   */
  parse(d: string): PathCommand[] {
    const commands: PathCommand[] = [];
    const parts = d.match(/[MLHVZCSQTAmlhvzcsqta]|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g);

    if (!parts) return commands;

    let i = 0;
    while (i < parts.length) {
      const part = parts[i];
      if (part === undefined) {
        i++;
        continue;
      }

      if (/[MLHVZCSQTAmlhvzcsqta]/.test(part)) {
        const type = part as PathCommandType;
        const upperType = type.toUpperCase();

        switch (upperType) {
          case 'Z':
            commands.push({ type });
            i++;
            break;

          case 'H': {
            i++;
            const xVal = parts[i];
            if (xVal !== undefined) {
              commands.push({
                type,
                x: parseFloat(xVal),
              });
              i++;
            }
            break;
          }

          case 'V': {
            i++;
            const yVal = parts[i];
            if (yVal !== undefined) {
              commands.push({
                type,
                y: parseFloat(yVal),
              });
              i++;
            }
            break;
          }

          case 'M':
          case 'L':
          case 'T': {
            i++;
            const xVal = parts[i];
            const yVal = parts[i + 1];
            if (xVal !== undefined && yVal !== undefined) {
              commands.push({
                type,
                x: parseFloat(xVal),
                y: parseFloat(yVal),
              });
              i += 2;
            }
            break;
          }

          case 'Q':
          case 'S': {
            i++;
            const x1Val = parts[i];
            const y1Val = parts[i + 1];
            const xVal = parts[i + 2];
            const yVal = parts[i + 3];
            if (
              x1Val !== undefined &&
              y1Val !== undefined &&
              xVal !== undefined &&
              yVal !== undefined
            ) {
              commands.push({
                type,
                x1: parseFloat(x1Val),
                y1: parseFloat(y1Val),
                x: parseFloat(xVal),
                y: parseFloat(yVal),
              });
              i += 4;
            }
            break;
          }

          case 'C': {
            i++;
            const x1Val = parts[i];
            const y1Val = parts[i + 1];
            const x2Val = parts[i + 2];
            const y2Val = parts[i + 3];
            const xVal = parts[i + 4];
            const yVal = parts[i + 5];
            if (
              x1Val !== undefined &&
              y1Val !== undefined &&
              x2Val !== undefined &&
              y2Val !== undefined &&
              xVal !== undefined &&
              yVal !== undefined
            ) {
              commands.push({
                type,
                x1: parseFloat(x1Val),
                y1: parseFloat(y1Val),
                x2: parseFloat(x2Val),
                y2: parseFloat(y2Val),
                x: parseFloat(xVal),
                y: parseFloat(yVal),
              });
              i += 6;
            }
            break;
          }

          case 'A': {
            i++;
            const rxVal = parts[i];
            const ryVal = parts[i + 1];
            const rotVal = parts[i + 2];
            const laVal = parts[i + 3];
            const swVal = parts[i + 4];
            const xVal = parts[i + 5];
            const yVal = parts[i + 6];
            if (
              rxVal !== undefined &&
              ryVal !== undefined &&
              rotVal !== undefined &&
              laVal !== undefined &&
              swVal !== undefined &&
              xVal !== undefined &&
              yVal !== undefined
            ) {
              commands.push({
                type,
                rx: parseFloat(rxVal),
                ry: parseFloat(ryVal),
                rotation: parseFloat(rotVal),
                largeArc: laVal === '1',
                sweep: swVal === '1',
                x: parseFloat(xVal),
                y: parseFloat(yVal),
              });
              i += 7;
            }
            break;
          }

          default:
            i++;
            break;
        }
      } else {
        i++;
      }
    }

    return commands;
  }

  /**
   * Convert relative commands to absolute
   */
  toAbsolute(commands: PathCommand[]): PathCommand[] {
    const result: PathCommand[] = [];
    let currentX = 0;
    let currentY = 0;

    for (const cmd of commands) {
      const isRelative = cmd.type === cmd.type.toLowerCase();
      const type = cmd.type.toUpperCase() as PathCommandType;

      if (isRelative) {
        // Convert to absolute
        switch (type) {
          case 'M':
          case 'L':
          case 'T':
            result.push({
              type,
              x: currentX + (cmd.x ?? 0),
              y: currentY + (cmd.y ?? 0),
            });
            currentX += cmd.x ?? 0;
            currentY += cmd.y ?? 0;
            break;

          case 'H':
            result.push({
              type,
              x: currentX + (cmd.x ?? 0),
            });
            currentX += cmd.x ?? 0;
            break;

          case 'V':
            result.push({
              type,
              y: currentY + (cmd.y ?? 0),
            });
            currentY += cmd.y ?? 0;
            break;

          case 'C':
            result.push({
              type,
              x1: currentX + (cmd.x1 ?? 0),
              y1: currentY + (cmd.y1 ?? 0),
              x2: currentX + (cmd.x2 ?? 0),
              y2: currentY + (cmd.y2 ?? 0),
              x: currentX + (cmd.x ?? 0),
              y: currentY + (cmd.y ?? 0),
            });
            currentX += cmd.x ?? 0;
            currentY += cmd.y ?? 0;
            break;

          case 'S':
          case 'Q':
            result.push({
              type,
              x1: currentX + (cmd.x1 ?? 0),
              y1: currentY + (cmd.y1 ?? 0),
              x: currentX + (cmd.x ?? 0),
              y: currentY + (cmd.y ?? 0),
            });
            currentX += cmd.x ?? 0;
            currentY += cmd.y ?? 0;
            break;

          case 'Z':
            result.push({ type: 'Z' });
            break;

          default:
            result.push(cmd);
        }
      } else {
        // Already absolute
        result.push(cmd);

        // Update current position
        if (cmd.x !== undefined) currentX = cmd.x;
        if (cmd.y !== undefined) currentY = cmd.y;
        if (type === 'H' && cmd.x !== undefined) currentX = cmd.x;
        if (type === 'V' && cmd.y !== undefined) currentY = cmd.y;
      }
    }

    return result;
  }

  /**
   * Convert commands back to path string
   */
  serialize(commands: PathCommand[]): string {
    return commands
      .map((cmd) => {
        switch (cmd.type.toUpperCase()) {
          case 'Z':
            return cmd.type;
          case 'H':
            return `${cmd.type}${cmd.x}`;
          case 'V':
            return `${cmd.type}${cmd.y}`;
          case 'M':
          case 'L':
          case 'T':
            return `${cmd.type}${cmd.x} ${cmd.y}`;
          case 'Q':
          case 'S':
            return `${cmd.type}${cmd.x1} ${cmd.y1} ${cmd.x} ${cmd.y}`;
          case 'C':
            return `${cmd.type}${cmd.x1} ${cmd.y1} ${cmd.x2} ${cmd.y2} ${cmd.x} ${cmd.y}`;
          case 'A':
            return `${cmd.type}${cmd.rx} ${cmd.ry} ${cmd.rotation} ${cmd.largeArc ? 1 : 0} ${cmd.sweep ? 1 : 0} ${cmd.x} ${cmd.y}`;
          default:
            return '';
        }
      })
      .join(' ');
  }
}

// Singleton instance
export const pathParser = new PathParser();
