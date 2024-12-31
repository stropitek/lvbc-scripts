# 2024

## Assignement process

1. Get the list of matches.
   - Export from VM. See [VB Manager](#vb-manager) for list of columns to export.
   - Move and rename the exported file so that it matches what is configured in `2024/params.mjs`.
   - Identify matches that must be merged, and set it up in `2024/params.mjs`.
2. Go to clubdesk and download the list of players.
   - Make sure to use an up to date list of active players.
   - The columns to export [are liste here](#clubdesk).
   - For new players, make sure to fill the "Marqueur" field appropriately.
   - Save with format "CSV (Excel)" to the file configured in `2024/params.mjs`
3. Run `node src/scripts/run.mjs`. You can choose between different tasks:
   - Check the sheet. It will print errors / warnings.
   - Find a scorer for a match.
   - Find a match for a scorer.
   - Show unassigned players.
   - Generate the assignement sheet.
   - If you need to run the script but choose a different file input, run `node src/scripts/run.mjs -i`.

### VB Manager

List of columns to export:

- \# Match
- H/F
- CL
- Ligue
- Groupe
- Jour
- Date/heure de début du match
- Club recevant
- Equipe recevante
- Equipe visiteuse
- Salle

### Clubdesk

List of columns to export (from the "Personnes" view):

- Groupes
- Nom (complet)
- Téléphone privé
- Sexe
- Marqueur
- E-mail
- Année de naissance
