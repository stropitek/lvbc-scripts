# 2024

## Assignement process

1. Go to volley ball manager and export all matches involving the club's team.
   - Merge consecutive junior matches (1 hour apart) that occur during the weekends together as 1 entry. Keep the two match identifiers in a new comment column.
   - Convert to a table and save.
   - Save to `input/<year>/vb-manager.xlsx`
2. Go to clubdesk and download the list of players.
   - Make sure to use an up to date list of active players.
   - For new players, make sure to fill the "Marqueur" field appropriately.
   - Save as excel cvs to `input/<year>/clubdesk_players.csv`
3. Run `init-scorers` script which reads the list of players and filters it to only keep those who can score matches.
4. Run `init-schedule` script which reads volleyball manager export of all matches involving the club's team, and cleans it up.
5. From this list filter home matches and write pre-assigned file.
6. Fill pre-assigned file by hand based on rules that cannot be easily automated.
7. Run fill-schedule script which fills in the blank according to rules. Creates assigned file.
8. Copy to assigned-tuned file and tune as needed.
9. Run `check-schedule` script to verify no match conflicts.
10. Run `check-schedule --external` script to verify a scheduled downloaded from google sheets after it has been edited.

# 2023

> [!WARNING]  
> This is the old process and might not work anymore. The new process is described above.

## Assignement process

1. Run `init-schedule` script which reads volleyball manager export of all matches involving the club's team
2. From this list filter home matches and write pre-assigned file.
3. Fill pre-assigned file by hand based on rules that cannot be easily automated.
4. Run `fill-schedule` script which fills in the blank according to rules. Creates assigned file.
5. Copy to assigned-tuned file and tune as needed.
6. Run `check-schedule` script to verify no match conflicts.
7. Run `check-schedule --external` script to verify a scheduled downloaded from google sheets after it has been edited.

## Other commands

`rewrite.mjs` is for rechecking a file which was downloaded from google sheets.
