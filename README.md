## Assignement process

1. Run init-schedule script which reads volleyball manager export of all matches involving the club's team
2. From this list filter home matches and write pre-assigned file.
3. Fill pre-assigned file by hand based on rules that cannot be easily automated.
4. Run fill-schedule script which fills in the blank according to rules. Creates assigned file.
5. Copy to assigned-tuned file and tune as needed.
6. Run `check-schedule` script to verify no match conflicts.
7. Run `check-schedule --external` script to verify a scheduled downloaded from google sheets after it has been edited.

## Other commands

`rewrite.mjs` is for rechecking a file which was downloaded from google sheets.
