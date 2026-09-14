# Private setup and verified SDK contract

Verified against the official Python SDK and documentation on 2026-09-09.

## Install the Python dependencies

On this Mac, `~/.local/bin/elevenlabs-voice` runs the canonical helper with
`~/.venvs/elevenlabs-voice/bin/python`. Use the launcher from any project:

```text
env -u ELEVENLABS_API_KEY "$HOME/.local/bin/elevenlabs-voice" doctor
env -u ELEVENLABS_API_KEY "$HOME/.local/bin/elevenlabs-voice" configure-voice
```

For an installation without that launcher, use a Python environment that
satisfies the dependency manifest below.

Keep the environment outside a project when practical:

```text
python3 -m venv <private-venv>
<private-venv>/bin/python -m pip install -r <skill-dir>/requirements.txt
```

The helper imports `ElevenLabs` from `elevenlabs.client` and uses the SDK for
every provider request. It creates the client with:

```text
base_url=https://api.elevenlabs.io
timeout=30
follow_redirects=False
```

Every SDK call sets `max_retries` to zero. Paid generation is never retried by
the helper.

## Key handling

The loader checks the memory-only `ELEVENLABS_API_KEY` environment variable
first. When that variable is unset or blank on macOS, it reads a
generic-password item with:

```text
service: rbuild-elevenlabs
account: current macOS username
```

Agents running under the same Mac account reuse this item across projects.
Use `doctor` to check credential status without displaying the value. Do not
run the Keychain lookup manually into terminal output, dump environment
variables, or ask the user to paste the key into a conversation. A missing
voice configuration or provider permission is not a reason to replace a
working key.

For this Mac's shared saved key, use the process-scoped prefix:

```text
env -u ELEVENLABS_API_KEY "$HOME/.local/bin/elevenlabs-voice" doctor
```

This removes the environment override only from the helper process. It does
not change the parent shell, edit the key, or copy it into another store.
The unprefixed helper still honors an explicit environment-key override when
the user asks for one. Never dump the environment to investigate precedence.

The same login account and normal Keychain/agent permissions are required.
This is not an API proxy for other computers, cloud agents, or different OS
accounts. Do not broaden Keychain access controls to avoid an approval.

Save or update that item only from a private TTY:

```text
python <skill-dir>/scripts/elevenlabs_voice.py save-key
```

The helper runs `security add-generic-password` with `-w` as the last option and
no password argument. Enter the ElevenLabs API key at the item-password prompt.
Do not enter the Mac login password. The API key never appears in process
arguments.

For a shell-only session, read the key without echo and export it for that
process tree:

```text
read -s ELEVENLABS_API_KEY
export ELEVENLABS_API_KEY
```

Do not use a repository dotenv file. Do not pass the key as a command option.

The helper uses a conservative `sk_` token-shape guard. This is a local safety
check, not a complete specification of valid provider keys. It blocks unknown
formats before transport so an accidentally stored Mac password is not sent.
Confirm an unfamiliar format with the provider before changing the guard.

## Private voice configuration

`configure-voice` discovers personal and workspace voices with pagination. It
shows only voice ID, name, category, and source. It never prints sample,
recording, or training metadata.

The selected voice is written to:

```text
~/.config/elevenlabs-voice/config.json
```

The directory is mode `0700`; the file is mode `0600`. The file stores the
voice ID and the user's explicit ownership or authorization confirmation. It
must stay outside repositories and must not be copied into a skill, report,
receipt, or wiki.

Voice metadata does not establish ownership or consent. The confirmation step
does.

## Command contract

| command | network | paid generation | result |
|---|---:|---:|---|
| `doctor` | no | no | checks SDK, key shape, private config, and `ffprobe` |
| `save-key` | Keychain only | no | opens the private macOS Keychain prompt |
| `voices` | yes | no | paginates personal and workspace voice metadata |
| `configure-voice` | yes | no | saves a user-confirmed private default |
| `models` | yes | no | lists current model IDs and capabilities |
| `status` | yes | no | checks model, subscription counters, scopes, and voice access |
| `tts` | yes | yes | reads a UTF-8 script and creates generated speech |
| `sts` | yes | yes | converts an existing audio take to the confirmed voice |

`tts` and `sts` accept encoded MP3, WAV, or Opus output formats exposed by the
installed SDK. They require `--purpose audition` or `--purpose candidate`.
Neither command labels audio final.

Exit codes:

- `0`: completed.
- `2`: local prerequisite, consent, path, config, or input failure.
- `3`: authentication or permission failure.
- `4`: provider quota or rate-limit refusal.
- `5`: network or timeout failure.
- `6`: provider protocol, model, stream, or audio-probe failure.

No failure writes a receipt. Known provider and transport failures are
sanitized without dumping SDK exceptions, request headers, or response bodies.
Unexpected programming errors propagate rather than being mislabeled as
provider failures.

Argument errors do not echo supplied values. Key-shaped arguments are rejected
before parsing or credential access. This cannot remove an argument already
typed into shell history, so the private prompt remains the required path.

## Offline regression checks

```text
python -m unittest discover -s <skill-dir>/tests
```

The tests use synthetic keys and voices. Real credential loading and live HTTP
transport are blocked inside the suite.

## Refreshing host discovery

Verified against the GitHub documentation on 2026-09-09: an existing Copilot CLI
session needs `/skills reload` after a new personal skill is installed. Check it
with `/skills info elevenlabs-voice`. A fresh process can list it with
`copilot skill list`.

These are host commands, not commands for this skill's Python helper.
Other hosts have their own skill-discovery lifecycle.

Source: https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills

## Cross-agent handoff

The shared skill is readable through `~/.agents/skills/elevenlabs-voice`,
`~/.copilot/skills/elevenlabs-voice`, and `~/.claude/skills/elevenlabs-voice`.
The latter two host conventions resolve to the same canonical skill; they
are not separate credential copies.

Default-profile startup pointers live in:

- Copilot CLI: `~/.copilot/copilot-instructions.md`
- Claude Code: `~/.claude/CLAUDE.md`
- Codex: `~/.codex/AGENTS.md`

Start a new session after changing global instructions. For Codex, a custom
`CODEX_HOME` or `AGENTS.override.md` can replace the default global file.
Do not remove an override; apply the same pointer to the intended profile
only when authorized.

Give another agent `agent-guide.html` from this directory when it does not
discover the skill automatically. The HTML is self-contained and includes a
copyable task brief, commands, paths, and failure handling, never the key.
Providing the file does not give a remote agent access to this Mac.

Codex source: https://developers.openai.com/codex/guides/agents-md

## Provider checks

Before generation, the helper:

1. Fetches current models and verifies the requested capability.
2. Reads current subscription counters without hardcoding a quota or price.
3. Paginates personal and workspace voices and verifies that the private
   configured voice remains accessible.
4. Checks the script against the model's current maximum request length when
   the provider returns one.

The generation endpoint may still reject a key whose read scopes pass. Do not
probe that permission with throwaway paid audio.

## Safe failure meanings

- `missing_key`: no environment key or Keychain item.
- `credential_lookup_failed`: Keychain access failed; resolve access rather
  than assuming the key was never saved.
- `unrecognized_key_format`: blocked locally; nothing was sent.
- `authentication_failed`: the provider rejected authentication. The key may be
  invalid, expired, or revoked.
- `missing_permissions`: the provider recognized the request but the key lacks
  a required scope. This can be HTTP `401`.
- `quota_or_rate_limit`: stop and check current provider limits. Do not retry a
  long take blindly.
- `network_failure`: no success is assumed and no fallback audio is created.

## Official sources

- https://elevenlabs.io/docs/eleven-api/resources/libraries
- https://elevenlabs.io/docs/api-reference/authentication
- https://elevenlabs.io/docs/api-reference/voices/search
- https://elevenlabs.io/docs/api-reference/speech-to-speech/convert
- https://elevenlabs.io/docs/api-reference/models/list
- https://elevenlabs.io/docs/api-reference/user/subscription/get
- https://elevenlabs.io/docs/overview/administration/workspaces/api-keys
