#!/usr/bin/env bash
# نصب اسکیل‌های عامل مورد استفاده در این پروژه.
# مقصد: ~/.pi/agent/skills  (شخصی — روی هر ماشینی یک‌بار اجرا شود)
set -u

SK="${HOME}/.pi/agent/skills"
TMP="$(mktemp -d)"
mkdir -p "$SK"

get() { # repo path dest
  local repo="$1" path="$2" dest="$3"
  rm -rf "$TMP/c"
  if ! git clone --depth 1 --filter=blob:none --sparse "https://github.com/${repo}.git" "$TMP/c" >/dev/null 2>&1; then
    echo "✗ clone failed: $repo"; return
  fi
  ( cd "$TMP/c" && git sparse-checkout set "$path" >/dev/null 2>&1 )
  if [ -d "$TMP/c/$path" ]; then
    rm -rf "$SK/$dest"
    cp -r "$TMP/c/$path" "$SK/$dest"
    echo "✓ $dest"
  else
    echo "✗ missing: $repo/$path"
  fi
}

get boraoztunc/skills            web-design-guidelines      web-design-guidelines
get emilkowalski/skills          skills/improve-animations  improve-animations
get anthropics/skills            skills/frontend-design     frontend-design
get joe-bell/cva                 .agents/skills/find-skills find-skills

# graphify: skill + CLI
rm -rf "$TMP/g"
if git clone --depth 1 https://github.com/Graphify-Labs/graphify.git "$TMP/g" >/dev/null 2>&1; then
  mkdir -p "$SK/graphify"
  cp "$TMP/g/graphify/skill-pi.md" "$SK/graphify/SKILL.md"
  echo "✓ graphify (skill)"
fi
command -v graphify >/dev/null 2>&1 || pip install --quiet graphifyy

rm -rf "$TMP"
echo "done → $SK"
