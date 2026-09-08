# Audit CPGE Menta — rentrée 2026-2027

## Objectif

Le profil CPGE de Menta ne doit pas réduire un étudiant à « prépa scientifique », « prépa littéraire » ou « ECG ». La nomenclature sert de source de vérité au Planning IA et doit distinguer la voie exacte, l’année, les options nationales, les langues et les particularités locales réellement suivies.

## Hiérarchie des sources

1. **Réglementation nationale** : Bulletin officiel du ministère, arrêtés et Légifrance.
2. **Concours** : pages officielles des ENS et banques de concours lorsque l’option dépend directement des épreuves.
3. **Onisep / Avenir(s)** : nomenclature actuelle, horaires et articulations entre première et deuxième année.
4. **Établissements CPGE** : validation des choix effectivement proposés et détection des variantes locales.

Une offre locale ne remplace jamais une règle nationale. Lorsqu’un lycée emploie un intitulé particulier pour une option nationale, Menta conserve le choix national et permet d’ajouter une « option locale / particularité du lycée ».

## Sources nationales de référence vérifiées

- Ministère — BO n°16 du 16 avril 2026 : liste des CPGE 2026-2027 et nomenclature des voies scientifiques.
- Légifrance — organisation générale et horaires des CPGE scientifiques, notamment MPSI, MP2I et options de deuxième période.
- ENS Paris-PSL — épreuves à option du concours A/L, page mise à jour pour les changements applicables à la session 2027.
- Onisep / Avenir(s) — pages 2025-2026/2026 des voies A/L, B/L, ECG, D1, D2, MPSI, MP2I, PCSI, PTSI, ATS économie-gestion et autres CPGE.

## Panel d’établissements croisés

Le contrôle des variantes locales a été mené sur plus de trente offres / sites d’établissements couvrant les grandes familles de CPGE. Tous ces lycées n’ouvrent évidemment pas toutes les micro-filières ; le but du panel est de détecter les pratiques réelles, les intitulés locaux et les options rares.

1. Louis-le-Grand — Paris
2. Henri-IV — Paris
3. Janson-de-Sailly — Paris
4. Molière — Paris
5. Diderot — Paris
6. Lakanal — Sceaux
7. Hoche — Versailles
8. Paul-Éluard — Saint-Denis
9. Saint-Sernin — Toulouse
10. Pierre-de-Fermat — Toulouse
11. Ozenne — Toulouse
12. Bellevue — Toulouse
13. Clemenceau — Nantes
14. Livet — Nantes
15. Chateaubriand — Rennes
16. Thiers — Marseille
17. Masséna — Nice
18. Champollion — Grenoble
19. Lycée du Parc — Lyon
20. Juliette-Récamier — Lyon
21. La Martinière Monplaisir — Lyon
22. Montaigne — Bordeaux
23. Gustave-Eiffel — Bordeaux
24. Faidherbe — Lille
25. Kléber — Strasbourg
26. Joffre — Montpellier
27. Descartes — Tours
28. Carnot — Dijon
29. Louis-Thuillier — Amiens
30. Paul-Valéry — Paris
31. Raspail — Paris
32. Notre-Dame des Minimes — Lyon

## Décisions de modélisation retenues

### Littéraires
- Hypokhâgne A/L : langue ancienne obligatoire, LVA, LVB facultative selon la combinaison d’enseignements, compléments réellement suivis.
- Khâgne ENS Lyon : spécialité exacte (lettres, philosophie, histoire-géographie, langues, arts) + langues + compléments.
- Khâgne ENS Ulm : langue ancienne + épreuve écrite à option A/L + langues + préparations complémentaires.
- B/L : deux choix en vue des concours parmi latin, grec, géographie, deuxième langue, sciences sociales ; LVB facultative ; civilisation renforcée en LVA enregistrable.
- Chartes : sections A et B séparées, y compris la préparation B adossée à une khâgne.
- Saint-Cyr lettres : langues et matière optionnelle obligatoire.

### Économiques et commerciales
- ECG : combinaison obligatoire mathématiques approfondies/appliquées × HGG/ESH + LVA/LVB.
- ECT : voie standard et dispositif en trois ans pour certains bacheliers professionnels.
- D1 : droit commercial / droit public / mathématiques appliquées et statistiques + LVB.
- D2 : dominante gestion / histoire des faits économiques + langue vivante.

### Scientifiques
- MPSI : sans option / informatique / SII, avec orientation de deuxième année.
- MP2I : sciences informatiques / SII.
- PCSI : physique-chimie / physique-SII.
- PTSI : module mathématiques pour l’orientation PSI, ou parcours PT.
- Deuxième année : MP/MP*, MPI/MPI*, PC/PC*, PSI/PSI*, PT/PT*, ainsi que BCPST, TSI, TPC et TB.
- TSI : dispositif bac professionnel en trois ans enregistré séparément.

### ATS et post-BTS/BTSA
- ATS économie-gestion : cinq enseignements optionnels actuels.
- ATS ingénierie industrielle.
- ATS génie civil.
- ATS métiers de la chimie : parcours chimie / génie des procédés.
- Classe Agro-Véto post-BTSA et BTS.
- ATS métiers de l’horticulture et du paysage.

## Règle produit

Menta stocke ces informations dans `profiles.study_track` et `profiles.study_options`. Les options locales restent possibles car l’offre d’un établissement peut être plus fine que la nomenclature nationale. Le Planning IA doit considérer le profil de compte comme source de vérité et ne jamais inventer une option non suivie.

## Maintenance

La liste doit être revue au minimum à chaque publication de la liste annuelle des CPGE au Bulletin officiel et avant une rentrée scolaire majeure. Toute modification de concours (par exemple un intitulé d’épreuve ENS) doit être répercutée dans la nomenclature avant la session concernée.
