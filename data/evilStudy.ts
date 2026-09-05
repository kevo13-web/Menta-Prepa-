export type RecallQuestion = {
  id: string;
  prompt: string;
  expected: string;
  explanation: string;
  keywordGroups: string[][];
  minMatches?: number;
};

export type FocusSheetSection = {
  title: string;
  paragraphs: string[];
  points?: string[];
  reference?: string;
};

export type FocusSheet = {
  id: string;
  title: string;
  subject: string;
  type: string;
  level: string;
  subtitle?: string;
  thesis?: string;
  sections?: FocusSheetSection[];
  distinctions?: string[];
  recall?: string[];
  quiz?: RecallQuestion[];
  demo?: boolean;
};

export const evilDemoSheet: FocusSheet = {
  id: "demo-mal-philosophie",
  title: "Le mal : privation, positivité, liberté et scandale de la raison",
  subject: "Philosophie",
  type: "Fiche conceptuelle",
  level: "Doctorat",
  demo: true,
  subtitle:
    "Cartographie problématique du mal, de l'ontologie augustinienne à la crise contemporaine de la théodicée.",
  thesis:
    "Le problème du mal devient philosophiquement aigu dès qu'on refuse simultanément deux solutions trop faciles : en faire une substance autonome, qui ruinerait l'unité de l'être, ou le réduire à une simple apparence, qui méconnaîtrait la réalité de la souffrance et de la faute. La tradition occidentale oscille ainsi entre dé-substantialisation ontologique, imputabilité morale, positivité de la liberté et critique de toute justification rationnelle de la souffrance.",
  sections: [
    {
      title: "I. Le nœud métaphysique : comment le mal peut-il être sans être ?",
      paragraphs: [
        "Chez Augustin, la solution décisive consiste à refuser au mal toute substantialité propre. Tout ce qui est, en tant qu'il est, possède une mesure, une forme et un ordre ; l'être est donc convertible, selon une structure néoplatonicienne christianisée, avec un certain degré de bien. Le mal ne constitue pas un étant supplémentaire opposé au bien : il est privatio boni, défaut d'une perfection qui devrait appartenir à une nature donnée.",
        "Cette thèse ne signifie pourtant pas que le mal serait irréel. La privation est ontologiquement parasitaire mais phénoménologiquement effective : une volonté corrompue, un corps mutilé ou une institution injuste existent positivement comme réalités, tandis que leur mal consiste dans la déficience d'ordre qui les affecte. L'avantage théologique est immédiat : Dieu n'a pas à créer le mal comme une chose. Mais le prix conceptuel est élevé, car il faut expliquer comment une privation peut produire des effets historiquement massifs.",
      ],
      points: [
        "Ne pas confondre privation et simple absence : la cécité est privation de la vue chez un être naturellement destiné à voir.",
        "Le mal n'est pas un principe rival du bien : l'anti-manichéisme est au cœur de l'argument augustinien.",
        "La dé-substantialisation du mal déplace la question de l'ontologie vers la volonté et la responsabilité.",
      ],
      reference: "Augustin, Confessions, livre VII ; De natura boni ; Enchiridion.",
    },
    {
      title: "II. Leibniz : rationaliser le mal sans l'attribuer directement à Dieu",
      paragraphs: [
        "La Théodicée leibnizienne systématise le problème en distinguant mal métaphysique, mal physique et mal moral. Le mal métaphysique désigne la limitation constitutive de toute créature finie ; le mal physique renvoie à la souffrance ; le mal moral à la faute. Dieu ne veut pas le mal moral comme fin, mais il peut le permettre dans l'économie du meilleur monde possible, c'est-à-dire du monde dont l'ensemble réalise le maximum de perfection compossible.",
        "L'argument ne consiste donc pas à prétendre que chaque événement est bon isolément. Il faut raisonner au niveau du système total des compossibles. La difficulté est alors épistémologique et morale : une justification globale peut-elle rendre intelligible une souffrance singulière sans la convertir en simple moyen d'une harmonie supérieure ? C'est précisément ce que les critiques modernes de la théodicée refuseront.",
      ],
      points: [
        "Possible ne signifie pas compossible : tous les biens imaginables ne peuvent pas nécessairement coexister dans un même monde.",
        "La permission du mal ne vaut pas approbation du mal.",
        "La théodicée cherche à concilier puissance, bonté et sagesse divines avec l'existence du mal.",
      ],
      reference: "Leibniz, Essais de Théodicée, notamment §§20-21 et la Préface.",
    },
    {
      title: "III. Kant : le mal radical comme structure de la maxime, non comme substance",
      paragraphs: [
        "Avec Kant, le centre de gravité se déplace vers la structure de la liberté. Le mal radical n'est ni une nature démoniaque ni une pulsion naturelle qui abolirait la responsabilité. Il consiste dans une propension de la volonté à inverser l'ordre des mobiles : au lieu de subordonner l'amour de soi à la loi morale, le sujet conditionne l'obéissance à la loi par ses intérêts sensibles.",
        "Le terme radical signifie que le mal concerne la racine de l'adoption des maximes, la Gesinnung, et non qu'il constituerait une substance diabolique. La difficulté devient alors celle d'une liberté qui doit pouvoir être imputée au sujet tout en étant décrite comme une propension universellement repérable dans l'humanité. Kant maintient ainsi ensemble universalité anthropologique et responsabilité intelligible.",
      ],
      points: [
        "Le mal n'est pas la sensibilité elle-même : les inclinations ne sont pas moralement mauvaises par nature.",
        "Le sujet mauvais reconnaît encore la loi morale ; il lui subordonne simplement d'autres mobiles selon un ordre inversé.",
        "Un être véritablement diabolique qui choisirait le mal pour le mal sortirait, chez Kant, du cadre proprement humain.",
      ],
      reference: "Kant, La religion dans les limites de la simple raison, première partie.",
    },
    {
      title: "IV. Schelling : penser une possibilité positive du mal sans retomber dans le dualisme",
      paragraphs: [
        "Le traité de 1809 sur la liberté radicalise le problème. Une simple théorie de la privation paraît insuffisante pour rendre compte de l'énergie positive de la faute. Schelling distingue en Dieu le fond obscur, Grund, et l'existence lumineuse, sans poser pour autant deux dieux ou deux substances. La créature libre peut désordonner le rapport des puissances et faire de ce qui devait rester particulier le principe dominant du tout.",
        "Le mal possède dès lors une positivité dynamique : il n'est pas une chose indépendante, mais une perversion active de l'ordre. L'enjeu est de rendre la liberté métaphysiquement réelle. Une liberté qui ne pourrait choisir que le bien serait une nécessité déguisée ; mais une liberté réellement capable du mal oblige la métaphysique à inscrire la possibilité du désordre au cœur même d'un monde créé.",
      ],
      points: [
        "Schelling ne réhabilite pas un manichéisme substantiel : la positivité du mal est celle d'une inversion de rapports.",
        "La possibilité du mal devient condition d'une liberté non mécanique.",
        "Le problème n'est plus seulement : d'où vient le défaut ? mais : comment une puissance d'inversion est-elle possible ?",
      ],
      reference: "Schelling, Recherches philosophiques sur l'essence de la liberté humaine, 1809.",
    },
    {
      title: "V. Nietzsche et Arendt : de la métaphysique du mal à la généalogie et à la politique",
      paragraphs: [
        "Nietzsche déplace l'interrogation : avant de demander ce qu'est le mal, il faut demander qui a intérêt à qualifier certaines forces de bonnes ou mauvaises. La généalogie déconstruit la prétention des valeurs morales à exprimer une structure éternelle de l'être. Le couple bien/mal peut devenir l'effet historique d'une production de valeurs, notamment dans la morale du ressentiment. Cela ne supprime pas la cruauté réelle, mais interdit de confondre immédiatement condamnation morale et description ontologique.",
        "Arendt, de son côté, fait apparaître une autre rupture. Dans Les Origines du totalitarisme, elle parle de mal radical pour désigner une destruction politique qui tend à rendre les hommes superflus. Dans Eichmann à Jérusalem, la formule de la banalité du mal ne signifie pas que les crimes seraient banals, mais qu'une catastrophe morale peut être accomplie par un agent dépourvu de profondeur démoniaque, dont la faillite tient à l'absence de pensée et de jugement. Le mal cesse ainsi d'être nécessairement spectaculaire dans sa subjectivité pour devenir administrativement normalisable.",
      ],
      points: [
        "Généalogiser le mal ne revient pas à nier toute normativité ; cela oblige à interroger la provenance des valeurs.",
        "La banalité du mal n'est pas une théorie générale de tout mal, ni une excuse psychologique d'Eichmann.",
        "La modernité politique oblige à penser le mal à l'échelle des dispositifs, des bureaucraties et de l'obéissance ordinaire.",
      ],
      reference: "Nietzsche, Généalogie de la morale ; Arendt, Les Origines du totalitarisme et Eichmann à Jérusalem.",
    },
    {
      title: "VI. Après la théodicée : souffrance, scandale et limites de la justification",
      paragraphs: [
        "La philosophie contemporaine devient particulièrement méfiante envers les discours qui totalisent la souffrance dans une économie rationnelle. Chez Levinas, la souffrance d'autrui résiste à la justification : l'expliquer comme moment nécessaire d'un ordre supérieur peut devenir moralement obscène. Le mal n'est plus seulement un problème spéculatif à résoudre ; il constitue une épreuve éthique qui met en question la prétention de la raison à convertir toute négativité en sens.",
        "Ricœur permet alors de distinguer plusieurs registres : faute, souffrance, symbole, récit, plainte. Les symboles du mal ne sont pas des définitions scientifiques, mais des matrices de compréhension par lesquelles une culture donne forme à l'expérience de l'impureté, du péché ou de la culpabilité. Le problème du mal déborde donc toute discipline unique : il touche simultanément ontologie, anthropologie, morale, politique, théologie et herméneutique.",
      ],
      points: [
        "Une explication causale du mal n'équivaut pas à une justification morale du mal.",
        "La souffrance subie et la faute commise ne doivent pas être rabattues l'une sur l'autre.",
        "Le refus de la théodicée peut lui-même devenir une position philosophique positive : préserver l'irréductibilité de la plainte et de la responsabilité.",
      ],
      reference: "Levinas, textes sur la souffrance inutile ; Ricœur, La symbolique du mal.",
    },
  ],
  distinctions: [
    "Mal ontologique / mal moral / mal physique : trois questions différentes qui ne doivent jamais être confondues.",
    "Privation / négation : une privation suppose une perfection due à la nature considérée.",
    "Expliquer / justifier : rendre intelligible une causalité ne légitime pas ce qui advient.",
    "Possibilité du mal / réalité du mal : une métaphysique de la liberté doit penser la première sans naturaliser la seconde.",
    "Responsabilité individuelle / production institutionnelle : l'analyse politique déplace le niveau d'imputation sans l'annuler automatiquement.",
  ],
  recall: [
    "Pourquoi la théorie augustinienne de la privatio boni est-elle anti-manichéenne ?",
    "En quoi le mal radical kantien est-il radical sans être diabolique ?",
    "Pourquoi Schelling juge-t-il nécessaire de donner au mal une positivité dynamique ?",
    "Quelle différence faut-il établir entre le mal radical des Origines du totalitarisme et la banalité du mal d'Eichmann à Jérusalem ?",
    "Pourquoi une théodicée peut-elle devenir moralement problématique lorsqu'elle rencontre la souffrance singulière ?",
  ],
  quiz: [
    {
      id: "augustin-privation",
      prompt: "Pourquoi la thèse augustinienne de la privatio boni est-elle une réponse anti-manichéenne au problème du mal ?",
      expected: "Augustin refuse au mal toute substance propre : le mal est une privation du bien dans un être qui, en tant qu'il existe, demeure bon à un certain degré. Il n'y a donc pas deux principes substantiels rivaux, le Bien et le Mal. Cette dé-substantialisation permet de préserver l'unité de la création tout en déplaçant le problème vers la corruption de la volonté et de l'ordre.",
      explanation: "Il fallait articuler privation, non-substantialité et refus d'un principe du mal rival du bien.",
      keywordGroups: [["privation", "privatio"], ["substance", "substantiel"], ["maniche", "dualism"], ["bien"], ["volonte", "ordre"]],
      minMatches: 3,
    },
    {
      id: "leibniz-trois-maux",
      prompt: "Distingue précisément les trois formes de mal chez Leibniz et explique leur fonction dans la Théodicée.",
      expected: "Le mal métaphysique est la limitation constitutive de toute créature finie ; le mal physique est la souffrance ; le mal moral est la faute. Leur distinction permet à Leibniz de penser que Dieu ne veut pas le mal moral comme fin mais peut le permettre dans l'économie du meilleur monde compossible.",
      explanation: "La réponse doit distinguer limitation, souffrance et faute, puis relier ces distinctions à la permission du mal dans le meilleur monde possible.",
      keywordGroups: [["metaphysique"], ["limitation", "finitude"], ["physique", "souffrance"], ["moral", "faute"], ["meilleur monde", "compossible", "permet"]],
      minMatches: 4,
    },
    {
      id: "kant-radical",
      prompt: "En quel sens le mal est-il « radical » chez Kant sans être pour autant diabolique ?",
      expected: "Le mal est radical parce qu'il touche la racine de l'adoption des maximes, la Gesinnung : le sujet inverse l'ordre des mobiles en subordonnant la loi morale à l'amour de soi. Il n'est pas diabolique, car le sujet humain reconnaît encore la loi morale et ne choisit pas le mal simplement pour le mal.",
      explanation: "Il fallait montrer que « radical » désigne la racine de la maxime, non une volonté démoniaque du mal pour le mal.",
      keywordGroups: [["racine", "radical"], ["maxime", "gesinnung"], ["loi morale"], ["amour de soi", "interet"], ["diabol", "mal pour le mal"]],
      minMatches: 3,
    },
    {
      id: "schelling-positivite",
      prompt: "Pourquoi Schelling estime-t-il qu'une simple théorie privative du mal ne suffit pas ?",
      expected: "Schelling veut rendre compte de l'énergie positive de la faute et de la réalité de la liberté. Le mal n'est pas une substance autonome, mais une inversion active du rapport des puissances : ce qui devait rester particulier prétend devenir principe du tout. Cette possibilité positive du désordre est requise pour qu'une liberté ne soit pas une nécessité déguisée.",
      explanation: "La clé est la positivité dynamique du mal comme inversion de l'ordre, liée à une liberté réellement capable du mal.",
      keywordGroups: [["positiv", "energie"], ["inversion", "desordre"], ["puissance", "grund"], ["liberte"], ["substance", "maniche"]],
      minMatches: 3,
    },
    {
      id: "arendt-double",
      prompt: "Distingue le « mal radical » des Origines du totalitarisme et la « banalité du mal » d'Eichmann à Jérusalem.",
      expected: "Dans Les Origines du totalitarisme, le mal radical renvoie à une domination qui tend à rendre les hommes superflus. Dans Eichmann à Jérusalem, la banalité du mal décrit la possibilité de crimes extrêmes commis sans profondeur démoniaque particulière, dans une faillite de la pensée et du jugement. La banalité qualifie donc le mode subjectif et administratif de l'accomplissement, non la gravité du crime.",
      explanation: "Il fallait éviter le contresens selon lequel « banal » signifierait insignifiant ou excusable.",
      keywordGroups: [["superflu"], ["totalitar"], ["banalite"], ["pensee", "jugement"], ["administr", "bureaucr"], ["pas banal", "gravite", "crime"]],
      minMatches: 4,
    },
    {
      id: "nietzsche-genealogie",
      prompt: "Quel déplacement méthodologique Nietzsche impose-t-il à la question philosophique du mal ?",
      expected: "Nietzsche substitue à la question métaphysique « qu'est-ce que le mal ? » une enquête généalogique sur la provenance et la fonction des valeurs. Il demande qui produit les catégories de bien et de mal, dans quels rapports de forces et avec quels affects, notamment le ressentiment.",
      explanation: "La réponse doit faire apparaître le passage de l'essence du mal à la généalogie des valeurs et aux rapports de forces.",
      keywordGroups: [["genealog"], ["provenance", "origine"], ["valeur"], ["rapport de force", "force"], ["ressentiment"]],
      minMatches: 3,
    },
    {
      id: "levinas-theodicee",
      prompt: "Pourquoi la critique lévinassienne de la théodicée ne se réduit-elle pas à dire que le mal est inexplicable ?",
      expected: "Levinas vise surtout la transformation de la souffrance d'autrui en moment justifié d'un ordre rationnel supérieur. L'enjeu est éthique : expliquer causalement n'est pas encore justifier, et donner un sens totalisant à la souffrance d'autrui peut devenir moralement obscène. Le refus de la théodicée protège ainsi l'irréductibilité de la plainte et de la responsabilité envers autrui.",
      explanation: "Il fallait distinguer impossibilité d'expliquer et refus éthique de justifier la souffrance dans une totalité rationnelle.",
      keywordGroups: [["souffrance"], ["autrui"], ["justif"], ["expli"], ["total", "ordre rationnel"], ["ethique", "responsabilite"]],
      minMatches: 4,
    },
    {
      id: "synthese",
      prompt: "Construis en quelques phrases la tension directrice qui traverse Augustin, Schelling et Kant sur le mal.",
      expected: "Augustin dé-substantialise le mal comme privation afin d'éviter le dualisme ; Schelling juge cette privation insuffisante pour expliquer la puissance active de la faute et pense une inversion positive de l'ordre ; Kant situe le mal dans la liberté de la maxime, comme inversion de l'ordre des mobiles. Tous refusent une substance autonome du mal, mais ils donnent des statuts différents à sa positivité et à son rapport à la liberté.",
      explanation: "Question de synthèse : il faut comparer les trois positions et faire apparaître à la fois leur refus du dualisme et leurs différences sur la liberté et la positivité du mal.",
      keywordGroups: [["augustin"], ["privation"], ["schelling"], ["inversion", "positiv"], ["kant"], ["maxime", "mobile"], ["liberte"], ["substance", "dualism"]],
      minMatches: 5,
    },
  ],
};