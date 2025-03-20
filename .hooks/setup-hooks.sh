#!/bin/sh

# Install commitlint dependencies via Deno
echo "Installing commitlint dependencies..."
deno cache npm:@commitlint/cli npm:@commitlint/config-conventional

# Ensure the JSON config file exists
if [ ! -f .commitlintrc.json ]; then
  echo "Creating commitlint JSON configuration file..."
  cat > .commitlintrc.json << EOF
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "body-max-line-length": [0, "always", 100]
  }
}
EOF
fi

# Make hooks executable
chmod +x .hooks/commit-msg
chmod +x .hooks/pre-commit

# Create symlinks to hooks in the .git/hooks directory
ln -sf ../../.hooks/commit-msg .git/hooks/commit-msg
ln -sf ../../.hooks/pre-commit .git/hooks/pre-commit

echo "Git hooks installed successfully" 