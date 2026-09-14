#!/usr/bin/env python3
"""Composite one video segment per cut in the edit decision list.

Every segment is rendered WITHOUT audio. The full-length mix is muxed on once
at the end by assemble.sh. That is deliberate: no per-segment audio seek can
drift, so sync holds by construction no matter how much the cut list churns.

Layouts:
  DUO       both hosts side by side          (the safe frame)
  SOLO_A    host A full frame                (A = hosts[0] in show.json)
  SOLO_B    host B full frame
  DEMO      shared screen large, hosts small down the left
  ANIM_DUO  animation card where the screen goes, hosts still on the left
  ANIM_FULL animation alone, full frame      (carries its own chrome)

Usage:
  render.py <root>              render every missing segment
  render.py <root> 0 3 11       re-render exactly these indices
"""
import json, os, subprocess, sys, shlex

W, H, FPS = 1920, 1080, 30

# DUO geometry
D_TW, D_TH, D_TY = 928, 760, 164
D_X1, D_X2 = 24, 968
# DEMO / ANIM_DUO left column
C_TW, C_TH = 400, 225
C_X, C_Y1, C_Y2 = 12, 308, 555
SCR_X, SCR_Y, SCR_W, SCR_H = 428, 128, 1480, 832
ANM_X, ANM_Y, ANM_W, ANM_H = 428, 187, 1480, 714
# SOLO geometry
S_W, S_H, S_X, S_Y = 1620, 912, 150, 88


class Show:
    def __init__(self, root):
        self.root = os.path.abspath(root)
        self.cfg = json.load(open(os.path.join(self.root, "show.json")))
        self.A, self.B = self.cfg["hosts"][0], self.cfg["hosts"][1]
        self.speech = json.load(open(os.path.join(self.root, "speech.json")))
        self.gfx = os.path.join(self.root, "gfx")
        self.segdir = os.path.join(self.root, "seg")
        # ffmpeg wants 0xRRGGBB, show.json carries #RRGGBB
        for h in (self.A, self.B):
            h["ff"] = "0x" + h["color"].lstrip("#")

    def p(self, name):
        return os.path.join(self.root, name)

    def talk(self, key, t0, t1):
        """enable= expression for when `key` is talking, in output-local time.
        Sub-0.4s slivers are dropped so the highlight does not strobe."""
        parts = []
        for a, b in self.speech[key]:
            a, b = max(a, t0), min(b, t1)
            if b - a > 0.4:
                parts.append(f"between(t,{a-t0:.2f},{b-t0:.2f})")
        return "+".join(parts) if parts else "0"


def box(x, y, w, h, colour, expr, th=5):
    return (f"drawbox=x={x-th}:y={y-th}:w={w+2*th}:h={h+2*th}:"
            f"color={colour}@1.0:t={th}:enable='{expr}'")


def seg_cmd(sh_, s, out):
    """Build the ffmpeg command for one segment.

    setpts=PTS-STARTPTS appears on EVERY video input on purpose. After -ss,
    inputs recorded at different frame rates refuse to composite and the tile
    silently renders black. Removing it from any one input blacks out only that
    tile, which looks like a cropping bug and sends you hunting in the wrong file.
    """
    t0, t1, dur, L = s["start"], s["end"], s["dur"], s["layout"]
    A, B = sh_.A, sh_.B
    ss = f"-ss {t0:.3f}"
    ins, fc = [], []

    if L == "ANIM_FULL":
        ins = [f"-ss {s['anim']:.3f} -i {shlex.quote(sh_.p(sh_.cfg['anim']))}"]
        fc.append(f"[0:v]setpts=PTS-STARTPTS,scale={W}:{H},fps={FPS}[out]")

    elif L in ("SOLO_A", "SOLO_B", f"SOLO_{A['key'].upper()}", f"SOLO_{B['key'].upper()}"):
        h = A if L in ("SOLO_A", f"SOLO_{A['key'].upper()}") else B
        ins = [f"{ss} -i {shlex.quote(sh_.p(h['file']))}",
               f"-i {shlex.quote(sh_.gfx + '/chrome.png')}",
               f"-i {shlex.quote(sh_.gfx + '/nm-' + h['key'] + '.png')}"]
        fc += [f"color=c=black:s={W}x{H}:r={FPS}[bg]",
               f"[0:v]setpts=PTS-STARTPTS,scale=-2:{S_H},crop={S_W}:{S_H},fps={FPS}[v]",
               f"[bg][v]overlay={S_X}:{S_Y}:shortest=1[a]",
               "[a][1:v]overlay=0:0[b]",
               f"[b][2:v]overlay={S_X+28}:{S_Y+S_H-60}[out]"]

    elif L == "DUO":
        ins = [f"{ss} -i {shlex.quote(sh_.p(A['file']))}",
               f"{ss} -i {shlex.quote(sh_.p(B['file']))}",
               f"-i {shlex.quote(sh_.gfx + '/chrome.png')}",
               f"-i {shlex.quote(sh_.gfx + '/nm-' + A['key'] + '.png')}",
               f"-i {shlex.quote(sh_.gfx + '/nm-' + B['key'] + '.png')}"]
        fc += [f"color=c=black:s={W}x{H}:r={FPS}[bg]",
               f"[0:v]setpts=PTS-STARTPTS,scale=-2:{D_TH},crop={D_TW}:{D_TH},fps={FPS}[l]",
               f"[1:v]setpts=PTS-STARTPTS,scale=-2:{D_TH},crop={D_TW}:{D_TH},fps={FPS}[r]",
               f"[bg][l]overlay={D_X1}:{D_TY}:shortest=1[a]",
               f"[a][r]overlay={D_X2}:{D_TY}[b]",
               f"[b]{box(D_X1,D_TY,D_TW,D_TH,A['ff'],sh_.talk(A['key'],t0,t1))},"
               f"{box(D_X2,D_TY,D_TW,D_TH,B['ff'],sh_.talk(B['key'],t0,t1))}[c]",
               "[c][2:v]overlay=0:0[d]",
               f"[d][3:v]overlay={D_X1+16}:{D_TY+D_TH-57}[e]",
               f"[e][4:v]overlay={D_X2+16}:{D_TY+D_TH-57}[out]"]

    elif L in ("DEMO", "ANIM_DUO"):
        if L == "DEMO":
            ins = [f"{ss} -i {shlex.quote(sh_.p(sh_.cfg['screen']))}"]
            main = (f"[0:v]setpts=PTS-STARTPTS,scale={SCR_W}:-2,"
                    f"crop={SCR_W}:{SCR_H},fps={FPS}[m]")
            mx, my = SCR_X, SCR_Y
        else:
            # Crop the animation's own chrome away so it does not compete with
            # the frame chrome. crop values come from measuring the animation,
            # not from guessing - see gfx.py.
            c = sh_.cfg.get("anim_crop", "1920:926:0:82")
            ins = [f"-ss {s['anim']:.3f} -i {shlex.quote(sh_.p(sh_.cfg['anim']))}"]
            main = (f"[0:v]setpts=PTS-STARTPTS,crop={c},"
                    f"scale={ANM_W}:{ANM_H},fps={FPS}[m]")
            mx, my = ANM_X, ANM_Y
        ins += [f"{ss} -i {shlex.quote(sh_.p(A['file']))}",
                f"{ss} -i {shlex.quote(sh_.p(B['file']))}",
                f"-i {shlex.quote(sh_.gfx + '/chrome.png')}",
                f"-i {shlex.quote(sh_.gfx + '/nm-' + A['key'] + '-s.png')}",
                f"-i {shlex.quote(sh_.gfx + '/nm-' + B['key'] + '-s.png')}"]
        fc += [f"color=c=black:s={W}x{H}:r={FPS}[bg]", main,
               f"[1:v]setpts=PTS-STARTPTS,scale=-2:{C_TH},crop={C_TW}:{C_TH},fps={FPS}[l]",
               f"[2:v]setpts=PTS-STARTPTS,scale=-2:{C_TH},crop={C_TW}:{C_TH},fps={FPS}[r]",
               f"[bg][m]overlay={mx}:{my}:shortest=1[a]",
               f"[a][l]overlay={C_X}:{C_Y1}[b]",
               f"[b][r]overlay={C_X}:{C_Y2}[c]",
               f"[c]{box(C_X,C_Y1,C_TW,C_TH,A['ff'],sh_.talk(A['key'],t0,t1),4)},"
               f"{box(C_X,C_Y2,C_TW,C_TH,B['ff'],sh_.talk(B['key'],t0,t1),4)}[d]",
               "[d][3:v]overlay=0:0[e]",
               f"[e][4:v]overlay={C_X+12}:{C_Y1+C_TH-49}[f]",
               f"[f][5:v]overlay={C_X+12}:{C_Y2+C_TH-49}[out]"]
    else:
        raise SystemExit(f"unknown layout {L!r} in segment {s['i']}")

    return (f"ffmpeg -v error -y {' '.join(ins)} "
            f'-filter_complex "{";".join(fc)}" -map "[out]" '
            f"-t {dur:.3f} -r {FPS} -c:v libx264 -preset medium -crf 18 "
            f"-pix_fmt yuv420p -g {FPS} -an {shlex.quote(out)}")


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else "."
    sh_ = Show(root)
    segs = json.load(open(os.path.join(sh_.root, "edl.json")))
    os.makedirs(sh_.segdir, exist_ok=True)
    only = [int(a) for a in sys.argv[2:] if a.isdigit()]
    for i, s in enumerate(segs):
        s["i"] = i
        s["dur"] = round(s["end"] - s["start"], 2)
        if only and i not in only:
            continue
        out = os.path.join(sh_.segdir, f"s{i:03d}.mp4")
        if os.path.exists(out) and not only:
            continue
        print(f"[{i:02d}/{len(segs)}] {s['layout']:9s} {s['dur']:6.1f}s  "
              f"{s['note'][:48]}", flush=True)
        cmd = seg_cmd(sh_, s, out)
        if subprocess.run(cmd, shell=True).returncode:
            print("FAILED:\n", cmd[:600]); sys.exit(1)
    print("done")


if __name__ == "__main__":
    main()
