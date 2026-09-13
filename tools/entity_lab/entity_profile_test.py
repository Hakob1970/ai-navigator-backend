import spacy

nlp = spacy.load("en_core_web_sm")


text = """
  **The Fall of the Kingdom**
                    

                        
                    

                        In the heart of Eldoria, a kingdom shrouded in mist and magic, dawn broke with an eerie stillness. The sun's rays struggled to pierce through the thick clouds, casting shadows over the ancient spires of Castle Aeloria, where whispers of treachery danced like ghosts in the air. The kingdom had thrived for centuries under the benevolent rule of Queen Elara, but now, a dark omen loomed over her realm—a prophecy foretelling its fall.
                    

                        
                    

                        In the bustling village of Brighthollow, nestled at the edge of the Whispering Woods, tales of the kingdom's downfall reached the ears of a young blacksmith named Kaelan. With tousled hair and eyes the color of stormy seas, he forged weapons and dreams in equal measure. Each clang of metal against metal echoed his ambition, yet his heart carried the weight of uncertainty. He had always felt different, drawn to the woods where the trees spoke in ancient tongues and the wind whispered secrets of forgotten heroes.
                    

                        
                    

                        One fateful evening, as twilight draped its velvet cloak over the land, Kaelan stumbled upon a hidden glade, illuminated by the soft glow of fireflies. In the center stood an ancient stone altar, adorned with symbols of a long-lost civilization. As he approached, a surge of energy coursed through him, igniting a flicker of courage he had never known. It was there that he found the Sword of Lirael, its blade shimmering with a light that banished the shadows. The moment he grasped the hilt, visions flooded his mind—of battles fought, of sacrifices made, and of a kingdom in peril.
                    

                        
                    

                        With the sword in hand, Kaelan felt an inexplicable call to action. The village had been plagued by strange occurrences—crops withering, livestock disappearing, and a growing darkness that seeped from the depths of the Whispering Woods. The elders spoke of a malevolent force awakening, an ancient sorcerer named Malakar, who sought to reclaim his dominion over Eldoria. Driven by a newfound purpose, Kaelan set forth, determined to confront the darkness and protect his home.
                    

                        
                    

                        As he journeyed deeper into the woods, he was joined by an unlikely companion—Lira, a fierce elven warrior with emerald eyes and a heart as wild as the forest itself. She had witnessed the devastation wrought by Malakar and pledged her loyalty to Kaelan's cause. Their bond grew through shared trials, laughter, and the unspoken understanding of a shared destiny. Together, they traversed treacherous paths, facing the sorcerer's minions and overcoming their own fears.
                    

                        
                    

                        However, their greatest challenge lay ahead. Upon reaching the Ruins of Eldar, the last stronghold against Malakar, they discovered the sorcerer's dark magic seeping through the stones, twisting the very fabric of reality. With every step, the air thickened with despair, and Kaelan felt the weight of his kingdom upon his shoulders. He knew that the fate of Eldoria rested in his hands, yet self-doubt gnawed at him. Was he truly the hero the prophecy spoke of, or merely an unknown blacksmith caught in a web of fate?
                    

                        
                    

                        In the heart of the ruins, Malakar awaited, cloaked in shadows and malice. His voice, a chilling whisper, promised power and dominion to those who would kneel. Kaelan felt the temptation tug at his heart, but the memory of his village, of Lira, and of the kingdom he loved ignited a fire within him. With Lira at his side, they charged into battle, the Sword of Lirael gleaming like a beacon of hope.
                    

                        
                    

                        The clash of steel rang through the desolation as Kaelan and Lira fought valiantly against the dark sorcerer. With each strike, Kaelan felt his doubts begin to fade. He fought not only for his kingdom but for the light that still flickered within every heart in Eldoria. In a moment of desperation, he unleashed the true power of the sword—a blinding light that shattered the darkness surrounding Malakar, revealing the remnants of a once-great sorcerer now stripped of his might.
                    

                        
                    

                        With a final, desperate surge, Kaelan thrust the sword forward, banishing Malakar into the void from whence he came. Silence fell, the oppressive gloom lifting like a shroud. As the ruins began to crumble, Kaelan and Lira escaped, the weight of their victory settling into their souls. They had not only saved their kingdom but had also uncovered the hero within themselves.
                    

                        
                    

                        Returning to Brighthollow, the villagers hailed them as champions. The sun broke through the clouds, bathing the land in warm light, and the first blossoms of spring began to bloom, a reminder that even in the darkest of times, hope could flourish. Kaelan stood before the gathered crowd, the Sword of Lirael at his side, no longer an unknown blacksmith but a hero forged in the fires of courage and love.
                    

                        
                    

                        In the years that followed, tales of The Fall of the Kingdom became legends, whispered in the winds that danced through Eldoria. And in the heart of the Whispering Woods, the glade where Kaelan had discovered his destiny remained, a sacred place where heroes were born, and the light of hope forever shone.
                    
"""

doc = nlp(text)


# ==========================================
# CANDIDATE COLLECTOR
# ==========================================

candidates = {}


for token in doc:

    # Пропускаем служебные слова и местоимения.
    if token.pos_ not in {"PROPN", "NOUN"}:
        continue

    name = token.text

    if name not in candidates:
        candidates[name] = {
            "mentions": 0,
            "pos": set(),
            "dependencies": set(),
            "heads": set(),
            "ner": set(),
        }

    candidates[name]["mentions"] += 1
    candidates[name]["pos"].add(token.pos_)
    candidates[name]["dependencies"].add(token.dep_)
    candidates[name]["heads"].add(token.head.text)

    if token.ent_type_:
        candidates[name]["ner"].add(token.ent_type_)


print("\n=== CANDIDATE COLLECTOR ===\n")

for name, data in candidates.items():

    print(f"ENTITY: {name}")
    print(f"  MENTIONS: {data['mentions']}")
    print(f"  POS: {sorted(data['pos'])}")
    print(f"  DEPENDENCIES: {sorted(data['dependencies'])}")
    print(f"  HEADS: {sorted(data['heads'])}")
    print(f"  NER: {sorted(data['ner'])}")
    print()

print("\n=== ENTITY PROFILE LAB ===\n")


# ==========================================
# SURFACE FORM COLLECTOR
# ==========================================

surface_forms = {}


for name in candidates:

    normalized = name.lower()

    if normalized not in surface_forms:
        surface_forms[normalized] = []

    surface_forms[normalized].append(name)


print("\n=== SURFACE FORM COLLECTOR ===\n")

for normalized, forms in surface_forms.items():

    print(f"NORMALIZED: {normalized}")
    print(f"  FORMS: {forms}")
    print()


for ent in doc.ents:
    print(f"ENTITY: {ent.text}")
    print(f"  NER: {ent.label_}")

    tokens = [
        token for token in doc
        if token.i >= ent.start and token.i < ent.end
    ]

    print("  TOKENS:")

    for token in tokens:
        print(
            f"    {token.text}"
            f" | POS={token.pos_}"
            f" | DEP={token.dep_}"
            f" | HEAD={token.head.text}"
        )

    print()

print("\n=== ALL TOKENS ===\n")

for token in doc:
    print(
        f"{token.text}"
        f" | POS={token.pos_}"
        f" | DEP={token.dep_}"
        f" | HEAD={token.head.text}"
        f" | ENT={token.ent_type_}"
    )


# ==========================================
# SPAN COLLECTOR
# ==========================================

spans = []

for token in doc:

    if token.dep_ not in {"compound", "amod"}:
        continue

    head = token.head

    if head.pos_ not in {"PROPN", "NOUN"}:
        continue

    start = min(token.i, head.i)
    end = max(token.i, head.i) + 1

    spans.append({
        "text": f"{token.text} {head.text}",
        "modifier": token.text,
        "head": head.text,
        "relation": token.dep_,
        "start": start,
        "end": end,
        "modifier_pos": token.pos_,
        "head_pos": head.pos_,
        "modifier_ner": token.ent_type_,
        "head_ner": head.ent_type_
    })


print("\n=== SPAN COLLECTOR ===\n")

for span in spans:

    print(
        f"SPAN: {span['text']}"
    )

    print(
        f"  MODIFIER: {span['modifier']}"
    )

    print(
        f"  HEAD: {span['head']}"
    )

    print(
        f"  RELATION: {span['relation']}"
    )

    print(
        f"  START: {span['start']}"
    )

    print(
        f"  END: {span['end']}"
    )

    print(
        f"  MODIFIER_POS: {span['modifier_pos']}"
    )

    print(
        f"  HEAD_POS: {span['head_pos']}"
    )

    print(
        f"  MODIFIER_NER: {span['modifier_ner']}"
    )

    print(
        f"  HEAD_NER: {span['head_ner']}"
    )

    print()


# ==========================================
# SPAN NORMALIZER
# ==========================================

normalized_spans = {}

for span in spans:

    normalized = span["text"].lower()

    if normalized not in normalized_spans:

        normalized_spans[normalized] = {
            "forms": set(),
            "relations": set(),
            "heads": set(),
            "records": []
        }

    normalized_spans[normalized]["forms"].add(
        span["text"]
    )

    normalized_spans[normalized]["relations"].add(
        span["relation"]
    )

    normalized_spans[normalized]["heads"].add(
        span["head"]
    )

    normalized_spans[normalized]["records"].append(
        span
    )


print("\n=== SPAN NORMALIZER ===\n")

for normalized, data in normalized_spans.items():

    print(
        f"NORMALIZED SPAN: "
        f"{normalized}"
    )

    print(
        f"  FORMS: "
        f"{sorted(data['forms'])}"
    )

    print(
        f"  RELATIONS: "
        f"{sorted(data['relations'])}"
    )

    print(
        f"  HEADS: "
        f"{sorted(data['heads'])}"
    )

    print()


# ==========================================
# SPAN RECORDS
# ==========================================

span_records = []

for normalized, data in normalized_spans.items():

    for record in data["records"]:

        span_records.append({
            "text": record["text"],
            "normalized": normalized,
            "kind": record["relation"],
            "start": record["start"],
            "end": record["end"],
            "parts": {
                "modifier": record["modifier"],
                "head": record["head"]
            },
            "features": {
                "modifier_pos": record["modifier_pos"],
                "head_pos": record["head_pos"],
                "modifier_ner": record["modifier_ner"],
                "head_ner": record["head_ner"]
            }
        })


print("\n=== SPAN RECORDS ===\n")

for record in span_records:

    print(
        f"SPAN: {record['text']}"
    )

    print(
        f"  NORMALIZED: {record['normalized']}"
    )

    print(
        f"  KIND: {record['kind']}"
    )

    print(
        f"  START: {record['start']}"
    )

    print(
        f"  END: {record['end']}"
    )

    print(
        f"  PARTS: {record['parts']}"
    )

    print(
        f"  FEATURES: {record['features']}"
    )

    print()

# ==========================================
# PREPOSITIONAL SPAN RECORDS
# ==========================================

for token in doc:

    if token.dep_ != "prep":
        continue

    if token.text.lower() != "of":
        continue

    head = token.head

    objects = [
        child
        for child in token.children
        if child.dep_ == "pobj"
    ]

    for obj in objects:

        start = min(
            head.i,
            token.i,
            obj.i
        )

        end = max(
            head.i,
            token.i,
            obj.i
        ) + 1

        span_records.append({
            "text": (
                f"{head.text} "
                f"{token.text} "
                f"{obj.text}"
            ),
            "normalized": (
                f"{head.text} "
                f"{token.text} "
                f"{obj.text}"
            ).lower(),
            "kind": "prepositional",
            "start": start,
            "end": end,
            "parts": {
                "head": head.text,
                "prep": token.text,
                "object": obj.text
            },
            "features": {
                "head_pos": head.pos_,
                "object_pos": obj.pos_,
                "head_ner": head.ent_type_,
                "object_ner": obj.ent_type_
            }
        })


print("\n=== PREPOSITIONAL SPAN RECORDS ===\n")

for record in span_records:

    if record["kind"] != "prepositional":
        continue

    print(f"SPAN: {record['text']}")
    print(f"  NORMALIZED: {record['normalized']}")
    print(f"  KIND: {record['kind']}")
    print(f"  START: {record['start']}")
    print(f"  END: {record['end']}")
    print(f"  PARTS: {record['parts']}")
    print(f"  FEATURES: {record['features']}")
    print()


# SPAN OBSERVATIONS
# ==========================================

span_observations = []

for span in span_records:

    span_observations.append({
        "source": "span",
        "observation": "STRUCTURAL_SPAN",
        "kind": span["kind"],
        "text": span["text"],
        "normalized": span["normalized"],
        "parts": span["parts"],
        "features": span["features"],
        "start": span["start"],
        "end": span["end"]
    })


print("\n=== SPAN OBSERVATIONS ===\n")

for observation in span_observations:

    print(
        f"SPAN: {observation['text']}"
    )

    print(
        f"  SOURCE: {observation['source']}"
    )

    print(
        f"  OBSERVATION: "
        f"{observation['observation']}"
    )

    print(
        f"  KIND: {observation['kind']}"
    )

    print(
        f"  PARTS: {observation['parts']}"
    )

    print(
        f"  START: {observation['start']}"
    )

    print(
        f"  END: {observation['end']}"
    )

    print()


# ==========================================
# CONTEXT EVIDENCE COLLECTOR
# ==========================================

print("\n=== CONTEXT EVIDENCE COLLECTOR ===\n")


for token in doc:

    if token.dep_ != "nsubj":
        continue

    subject = token.text
    verb = token.head.text

    objects = []

    for child in token.head.children:

        if child.dep_ in {"dobj", "attr", "pobj"}:
            objects.append(child.text)

    print(f"SUBJECT: {subject}")
    print(f"  VERB: {verb}")
    print(f"  OBJECTS: {objects}")
    print()


# ==========================================
# RELATION COLLECTOR
# ==========================================

print("\n=== RELATION COLLECTOR ===\n")


relations = []


for token in doc:

    # Нас интересуют только глаголы.
    if token.pos_ not in {"VERB", "AUX"}:
        continue

    subject = None

    # Ищем субъект глагола.
    for child in token.children:

        if child.dep_ in {"nsubj", "nsubjpass"}:
            subject = child

            break

    if subject is None:
        continue


    # Ищем прямой объект.
    for child in token.children:

        if child.dep_ in {"dobj", "attr"}:

            relations.append({
                "subject": subject.text,
                "verb": token.text,
                "object": child.text
            })


    # Ищем объект через предлог.
    for prep in token.children:

        if prep.dep_ != "prep":
            continue


        for obj in prep.children:

            if obj.dep_ != "pobj":
                continue


            relations.append({
                "subject": subject.text,
                "verb": f"{token.text}_{prep.text}",
                "object": obj.text
            })


for relation in relations:

    print(
        f"{relation['subject']} "
        f"→ {relation['verb']} "
        f"→ {relation['object']}"
    )


# ==========================================
# RELATION EVIDENCE PROFILE
# ==========================================

print("\n=== RELATION EVIDENCE PROFILE ===\n")


relation_profiles = {}


for relation in relations:

    subject = relation["subject"]
    verb = relation["verb"]
    object_ = relation["object"]


    # Профиль субъекта
    if subject not in relation_profiles:

        relation_profiles[subject] = {
            "acts": [],
            "acted_on_by": []
        }


    relation_profiles[subject]["acts"].append({
        "verb": verb,
        "object": object_
    })


    # Профиль объекта
    if object_ not in relation_profiles:

        relation_profiles[object_] = {
            "acts": [],
            "acted_on_by": []
        }


    relation_profiles[object_]["acted_on_by"].append({
        "verb": verb,
        "subject": subject
    })


for entity, profile in relation_profiles.items():

    print(f"ENTITY: {entity}")


    if profile["acts"]:

        print("  ACTS:")

        for action in profile["acts"]:

            print(
                f"    {action['verb']} "
                f"→ {action['object']}"
            )


    if profile["acted_on_by"]:

        print("  ACTED ON BY:")

        for action in profile["acted_on_by"]:

            print(
                f"    {action['subject']} "
                f"→ {action['verb']}"
            )


    print()


# ==========================================
# ENTITY PROFILE BUILDER
# ==========================================

print("\n=== ENTITY PROFILE BUILDER ===\n")


entity_profiles = {}


def get_profile(name):

    if name not in entity_profiles:

        entity_profiles[name] = {
            "surface_forms": set(),
            "mentions": 0,
            "pos": set(),
            "dependencies": set(),
            "heads": set(),
            "ner": set(),
            "acts": [],
            "acted_on_by": []
        }

    return entity_profiles[name]


# ------------------------------------------
# TOKEN EVIDENCE
# ------------------------------------------

for token in doc:

    if token.pos_ not in {"PROPN", "NOUN"}:
        continue

    profile = get_profile(token.text)

    profile["surface_forms"].add(token.text)
    profile["mentions"] += 1
    profile["pos"].add(token.pos_)
    profile["dependencies"].add(token.dep_)
    profile["heads"].add(token.head.text)

    if token.ent_type_:
        profile["ner"].add(token.ent_type_)


# ------------------------------------------
# RELATION EVIDENCE
# ------------------------------------------

for relation in relations:

    subject = relation["subject"]
    verb = relation["verb"]
    object_ = relation["object"]

    subject_profile = get_profile(subject)

    subject_profile["acts"].append({
        "verb": verb,
        "object": object_
    })


    object_profile = get_profile(object_)

    object_profile["acted_on_by"].append({
        "subject": subject,
        "verb": verb
    })


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for name, profile in entity_profiles.items():

    print(f"ENTITY: {name}")

    print(
        f"  SURFACE FORMS: "
        f"{sorted(profile['surface_forms'])}"
    )

    print(
        f"  MENTIONS: "
        f"{profile['mentions']}"
    )

    print(
        f"  POS: "
        f"{sorted(profile['pos'])}"
    )

    print(
        f"  DEPENDENCIES: "
        f"{sorted(profile['dependencies'])}"
    )

    print(
        f"  HEADS: "
        f"{sorted(profile['heads'])}"
    )

    print(
        f"  NER: "
        f"{sorted(profile['ner'])}"
    )


    if profile["acts"]:

        print("  ACTS:")

        for action in profile["acts"]:

            print(
                f"    {action['verb']} "
                f"→ {action['object']}"
            )


    if profile["acted_on_by"]:

        print("  ACTED ON BY:")

        for action in profile["acted_on_by"]:

            print(
                f"    {action['subject']} "
                f"→ {action['verb']}"
            )

    print()


# ==========================================
# IDENTITY EVIDENCE
# ==========================================

print("\n=== IDENTITY EVIDENCE ===\n")


entity_names = list(entity_profiles.keys())


for i in range(len(entity_names)):

    first = entity_names[i]

    for j in range(i + 1, len(entity_names)):

        second = entity_names[j]


        first_normalized = first.lower()
        second_normalized = second.lower()


        evidence = []


        # ----------------------------------
        # SURFACE FORM
        # ----------------------------------

        if first_normalized == second_normalized:

            evidence.append(
                "same_normalized_form"
            )


        # ----------------------------------
        # NER AGREEMENT
        # ----------------------------------

        first_ner = entity_profiles[first]["ner"]
        second_ner = entity_profiles[second]["ner"]


        if (
            first_ner
            and second_ner
            and first_ner.intersection(second_ner)
        ):

            evidence.append(
                "shared_ner_type"
            )


        # ----------------------------------
        # POS AGREEMENT
        # ----------------------------------

        first_pos = entity_profiles[first]["pos"]
        second_pos = entity_profiles[second]["pos"]


        if (
            first_pos
            and second_pos
            and first_pos.intersection(second_pos)
        ):

            evidence.append(
                "shared_pos"
            )


        # ----------------------------------
        # RELATION VERBS
        # ----------------------------------

        first_verbs = {
            action["verb"]
            for action in entity_profiles[first]["acts"]
        }

        second_verbs = {
            action["verb"]
            for action in entity_profiles[second]["acts"]
        }


        if first_verbs.intersection(second_verbs):

            evidence.append(
                "shared_action"
            )


        # ----------------------------------
        # DISPLAY
        # ----------------------------------

        if evidence:

            print(
                f"{first} ↔ {second}"
            )

            for item in evidence:

                print(
                    f"  EVIDENCE: {item}"
                )

            print()



# ==========================================
# RELATION IDENTITY EVIDENCE
# ==========================================

print("\n=== RELATION IDENTITY EVIDENCE ===\n")


entity_names = list(entity_profiles.keys())


for i in range(len(entity_names)):

    first = entity_names[i]

    for j in range(i + 1, len(entity_names)):

        second = entity_names[j]


        evidence = []


        # ----------------------------------
        # ACTION TARGETS
        # ----------------------------------

        first_targets = {
            action["object"]
            for action in entity_profiles[first]["acts"]
        }

        second_targets = {
            action["object"]
            for action in entity_profiles[second]["acts"]
        }


        shared_targets = (
            first_targets
            .intersection(second_targets)
        )


        if shared_targets:

            evidence.append(
                f"shared_targets={sorted(shared_targets)}"
            )


        # ----------------------------------
        # ACTION VERBS
        # ----------------------------------

        first_verbs = {
            action["verb"]
            for action in entity_profiles[first]["acts"]
        }

        second_verbs = {
            action["verb"]
            for action in entity_profiles[second]["acts"]
        }


        shared_verbs = (
            first_verbs
            .intersection(second_verbs)
        )


        if shared_verbs:

            evidence.append(
                f"shared_verbs={sorted(shared_verbs)}"
            )


        # ----------------------------------
        # ACTED ON BY
        # ----------------------------------

        first_subjects = {
            action["subject"]
            for action in entity_profiles[first]["acted_on_by"]
        }

        second_subjects = {
            action["subject"]
            for action in entity_profiles[second]["acted_on_by"]
        }


        shared_subjects = (
            first_subjects
            .intersection(second_subjects)
        )


        if shared_subjects:

            evidence.append(
                f"shared_relation_subjects={sorted(shared_subjects)}"
            )


        # ----------------------------------
        # DISPLAY
        # ----------------------------------

        if evidence:

            print(
                f"{first} ↔ {second}"
            )

            for item in evidence:

                print(
                    f"  EVIDENCE: {item}"
                )

            print()


# ==========================================
# CONTEXT IDENTITY EVIDENCE
# ==========================================

print("\n=== CONTEXT IDENTITY EVIDENCE ===\n")


entity_names = list(entity_profiles.keys())


for i in range(len(entity_names)):

    first = entity_names[i]

    for j in range(i + 1, len(entity_names)):

        second = entity_names[j]


        evidence = []


        # ----------------------------------
        # SHARED HEADS
        # ----------------------------------

        first_heads = entity_profiles[first]["heads"]
        second_heads = entity_profiles[second]["heads"]

        shared_heads = (
            first_heads
            .intersection(second_heads)
        )

        if shared_heads:

            evidence.append(
                f"shared_heads={sorted(shared_heads)}"
            )


        # ----------------------------------
        # SHARED DEPENDENCY ROLES
        # ----------------------------------

        first_dependencies = (
            entity_profiles[first]["dependencies"]
        )

        second_dependencies = (
            entity_profiles[second]["dependencies"]
        )

        shared_dependencies = (
            first_dependencies
            .intersection(second_dependencies)
        )

        if shared_dependencies:

            evidence.append(
                f"shared_dependencies="
                f"{sorted(shared_dependencies)}"
            )


        # ----------------------------------
        # SHARED SURFACE FORMS
        # ----------------------------------

        first_forms = (
            entity_profiles[first]["surface_forms"]
        )

        second_forms = (
            entity_profiles[second]["surface_forms"]
        )

        shared_forms = (
            first_forms
            .intersection(second_forms)
        )

        if shared_forms:

            evidence.append(
                f"shared_surface_forms="
                f"{sorted(shared_forms)}"
            )


        # ----------------------------------
        # DISPLAY
        # ----------------------------------

        if evidence:

            print(
                f"{first} ↔ {second}"
            )

            for item in evidence:

                print(
                    f"  EVIDENCE: {item}"
                )

            print()


# ==========================================
# CHARACTER EVIDENCE
# ==========================================

print("\n=== CHARACTER EVIDENCE ===\n")


character_evidence = {}


for name, profile in entity_profiles.items():

    observations = []


    # ----------------------------------
    # PERSON NER OBSERVATION
    # ----------------------------------

    if "PERSON" in profile["ner"]:

        observations.append({
            "source": "ner",
            "observation": "PERSON"
        })


    # ----------------------------------
    # SUBJECT ROLE OBSERVATION
    # ----------------------------------

    if "nsubj" in profile["dependencies"]:

        observations.append({
            "source": "syntax",
            "observation": "SUBJECT_ROLE"
        })


    # ----------------------------------
    # PASSIVE SUBJECT OBSERVATION
    # ----------------------------------

    if "nsubjpass" in profile["dependencies"]:

        observations.append({
            "source": "syntax",
            "observation": "PASSIVE_SUBJECT"
        })


    # ----------------------------------
    # ACTION OBSERVATION
    # ----------------------------------

    if profile["acts"]:

        observations.append({
            "source": "action",
            "observation": "PERFORMS_ACTION"
        })


    # ----------------------------------
    # RELATION PARTICIPATION OBSERVATION
    # ----------------------------------

    if profile["acted_on_by"]:

        observations.append({
            "source": "relation",
            "observation": "PARTICIPATES_IN_RELATION"
        })


    # ----------------------------------
    # REPEATED MENTION OBSERVATION
    # ----------------------------------

    if profile["mentions"] > 1:

        observations.append({
            "source": "repetition",
            "observation": "REPEATED_MENTIONS"
        })


    character_evidence[name] = observations


# ----------------------------------
# DISPLAY
# ----------------------------------

for name, observations in character_evidence.items():

    if not observations:
        continue


    print(f"ENTITY: {name}")

    print("  OBSERVATIONS:")


    for item in observations:

        print(
            f"    SOURCE: "
            f"{item['source']}"
        )

        print(
            f"    OBSERVATION: "
            f"{item['observation']}"
        )


    print()


# ==========================================
# CHARACTER RESOLUTION INPUT
# ==========================================

print("\n=== CHARACTER RESOLUTION INPUT ===\n")


for name, profile in entity_profiles.items():

    print(f"ENTITY: {name}")

    print(
        f"  MENTIONS: "
        f"{profile['mentions']}"
    )

    print(
        f"  NER: "
        f"{sorted(profile['ner'])}"
    )

    print(
        f"  POS: "
        f"{sorted(profile['pos'])}"
    )

    print(
        f"  DEPENDENCIES: "
        f"{sorted(profile['dependencies'])}"
    )

    print(
        f"  HEADS: "
        f"{sorted(profile['heads'])}"
    )

    print(
        f"  SURFACE FORMS: "
        f"{sorted(profile['surface_forms'])}"
    )


    if profile["acts"]:

        print("  ACTS:")

        for action in profile["acts"]:

            print(
                f"    {action['verb']} "
                f"→ {action['object']}"
            )


    if profile["acted_on_by"]:

        print("  ACTED ON BY:")

        for action in profile["acted_on_by"]:

            print(
                f"    {action['subject']} "
                f"→ {action['verb']}"
            )

    print()



# ==========================================
# EVIDENCE CLASSIFIER
# ==========================================

print("\n=== EVIDENCE CLASSIFIER ===\n")


classified_evidence = {}


for name, observations in character_evidence.items():

    classified = []


    for observation in observations:

        source = observation["source"]
        observation_type = observation["observation"]


        # ----------------------------------
        # CHARACTER SUPPORT
        # ----------------------------------

        if (
            source == "ner"
            and observation_type == "PERSON"
        ):

            classified.append({
                "source": source,
                "observation": observation_type,
                "hypothesis": "CHARACTER",
                "direction": "SUPPORTS",
                "strength": "STRONG"
            })

            continue


        # ----------------------------------
        # NEUTRAL OBSERVATIONS
        # ----------------------------------

        classified.append({
            "source": source,
            "observation": observation_type,
            "hypothesis": "CHARACTER",
            "direction": "NEUTRAL",
            "strength": "WEAK"
        })


    classified_evidence[name] = classified


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for name, observations in classified_evidence.items():

    if not observations:
        continue


    print(f"ENTITY: {name}")


    for item in observations:

        print(
            f"  SOURCE: "
            f"{item['source']}"
        )

        print(
            f"  OBSERVATION: "
            f"{item['observation']}"
        )

        print(
            f"  HYPOTHESIS: "
            f"{item['hypothesis']}"
        )

        print(
            f"  DIRECTION: "
            f"{item['direction']}"
        )

        print(
            f"  STRENGTH: "
            f"{item['strength']}"
        )

        print()

# ==========================================
# CHARACTER HYPOTHESIS
# ==========================================

print("\n=== CHARACTER HYPOTHESIS ===\n")


for name, profile in entity_profiles.items():

    supporting = []
    contradicting = []
    neutral = []


    # ----------------------------------
    # SUPPORTING EVIDENCE
    # ----------------------------------

    if "PERSON" in profile["ner"]:
        supporting.append("person_ner")

    if "nsubj" in profile["dependencies"]:
        supporting.append("subject_role")

    if "nsubjpass" in profile["dependencies"]:
        supporting.append("passive_subject")

    if profile["acts"]:
        supporting.append("performs_actions")

    if profile["acted_on_by"]:
        supporting.append("participates_in_relations")

    if profile["mentions"] > 1:
        supporting.append("repeated_mentions")


    # ----------------------------------
    # CONTRADICTING EVIDENCE
    # ----------------------------------

    non_person_ner = (
        profile["ner"]
        - {"PERSON"}
    )

    if non_person_ner:

        contradicting.append(
            f"non_person_ner={sorted(non_person_ner)}"
        )


    if "dobj" in profile["dependencies"]:
        contradicting.append("object_role")


    if "attr" in profile["dependencies"]:
        contradicting.append("attribute_role")


    if "compound" in profile["dependencies"]:
        contradicting.append("compound_role")


    # ----------------------------------
    # NEUTRAL EVIDENCE
    # ----------------------------------

    if profile["pos"]:
        neutral.append("pos")

    if profile["heads"]:
        neutral.append("head")

    if profile["surface_forms"]:
        neutral.append("surface_form")


    # ----------------------------------
    # DISPLAY
    # ----------------------------------

    print(f"ENTITY: {name}")


    if supporting:

        print("  SUPPORTING:")

        for item in supporting:

            print(
                f"    {item}"
            )


    if contradicting:

        print("  CONTRADICTING:")

        for item in contradicting:

            print(
                f"    {item}"
            )


    if neutral:

        print("  NEUTRAL:")

        for item in neutral:

            print(
                f"    {item}"
            )


    print()


# ==========================================
# OBSERVATION PROFILE
# ==========================================

print("\n=== OBSERVATION PROFILE ===\n")


for name, profile in entity_profiles.items():

    print(f"ENTITY: {name}")

    print("  OBSERVATIONS:")

    print(
        f"    NER: "
        f"{sorted(profile['ner'])}"
    )

    print(
        f"    POS: "
        f"{sorted(profile['pos'])}"
    )

    print(
        f"    DEPENDENCIES: "
        f"{sorted(profile['dependencies'])}"
    )

    print(
        f"    HEADS: "
        f"{sorted(profile['heads'])}"
    )

    print(
        f"    MENTIONS: "
        f"{profile['mentions']}"
    )

    print(
        f"    ACTS: "
        f"{'yes' if profile['acts'] else 'no'}"
    )

    print(
        f"    ACTED_ON_BY: "
        f"{'yes' if profile['acted_on_by'] else 'no'}"
    )

    print(
        f"    SURFACE_FORMS: "
        f"{sorted(profile['surface_forms'])}"
    )

    print()

# ==========================================
# SEMANTIC CONTEXT COLLECTOR
# ==========================================

print("\n=== SEMANTIC CONTEXT COLLECTOR ===\n")


semantic_context = {}


for token in doc:

    # Нас интересуют только сущности,
    # которые уже прошли Candidate Collector.
    if token.text not in entity_profiles:
        continue


    if token.text not in semantic_context:

        semantic_context[token.text] = {
            "modifiers": set(),
            "appositions": set(),
            "descriptions": set(),
            "nearby_words": set()
        }


    context = semantic_context[token.text]


    # ------------------------------------------
    # MODIFIERS
    # ------------------------------------------

    for child in token.children:

        if child.dep_ in {
            "amod",
            "compound",
            "nmod"
        }:

            context["modifiers"].add(
                child.text
            )


    # ------------------------------------------
    # APPOSITIONS
    # ------------------------------------------

    for child in token.children:

        if child.dep_ == "appos":

            context["appositions"].add(
                child.text
            )


    # ------------------------------------------
    # DESCRIPTION / ATTRIBUTE
    # ------------------------------------------

    head = token.head

    if head.dep_ in {"attr", "acomp"}:

        context["descriptions"].add(
            head.text
        )


    # ------------------------------------------
    # NEARBY WORDS
    # ------------------------------------------

    start = max(
        0,
        token.i - 3
    )

    end = min(
        len(doc),
        token.i + 4
    )


    for nearby in doc[start:end]:

        if nearby.i == token.i:
            continue

        context["nearby_words"].add(
            nearby.text
        )


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for name, context in semantic_context.items():

    print(f"ENTITY: {name}")

    print(
        f"  MODIFIERS: "
        f"{sorted(context['modifiers'])}"
    )

    print(
        f"  APPOSITIONS: "
        f"{sorted(context['appositions'])}"
    )

    print(
        f"  DESCRIPTIONS: "
        f"{sorted(context['descriptions'])}"
    )

    print(
        f"  NEARBY WORDS: "
        f"{sorted(context['nearby_words'])}"
    )

    print()


# ==========================================
# EXPLICIT DEFINITION EVIDENCE
# ==========================================

print("\n=== EXPLICIT DEFINITION EVIDENCE ===\n")


explicit_definition_observations = []


for token in doc:

    # Ищем конструкции:
    #
    # ENTITY → was/is → TYPE
    #
    # Пока это только структурное наблюдение.
    # Никакой гипотезы CHARACTER / LOCATION
    # здесь не назначаем.


    if token.lemma_.lower() != "be":

        continue


    subject = None
    definition = None


    # ------------------------------------------
    # SUBJECT
    # ------------------------------------------

    for child in token.children:

        if child.dep_ in {
            "nsubj",
            "nsubjpass"
        }:

            subject = child

            break


    if subject is None:

        continue


    # ------------------------------------------
    # DEFINITION / ATTRIBUTE
    # ------------------------------------------

    for child in token.children:

        if child.dep_ in {
            "attr",
            "acomp"
        }:

            definition = child

            break


    if definition is None:

        continue


    # ------------------------------------------
    # OBSERVATION RECORD
    # ------------------------------------------

    explicit_definition_observations.append({

        "entity": subject.text,

        "definition": definition.text,

        "relation": "is",

        "token_index": subject.i,

        "definition_token_index": definition.i

    })


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for observation in explicit_definition_observations:

    print(
        f"ENTITY: "
        f"{observation['entity']}"
    )

    print(
        f"  DEFINITION: "
        f"{observation['definition']}"
    )

    print(
        f"  RELATION: "
        f"{observation['entity']} "
        f"→ is → "
        f"{observation['definition']}"
    )

    print(
        f"  TOKEN INDEX: "
        f"{observation['token_index']}"
    )

    print(
        f"  DEFINITION TOKEN INDEX: "
        f"{observation['definition_token_index']}"
    )

    print()


# ==========================================
# DIALOGUE PARTICIPANT SENSOR
# ==========================================

print("\n=== DIALOGUE PARTICIPANT SENSOR ===\n")

dialogue_participants = []

dialogue_verbs = {
    "say",
    "said",
    "tell",
    "told",
    "ask",
    "asked",
    "reply",
    "replied",
    "answer",
    "answered",
    "shout",
    "shouted",
    "whisper",
    "whispered",
    "cry",
    "cried",
    "call",
    "called",
    "speak",
    "spoke",
    "speaking"
}


for token in doc:

    if token.lemma_.lower() not in dialogue_verbs:
        continue


    subject = None


    # ------------------------------------------
    # PATH 1
    #
    # Direct subject of the dialogue verb.
    #
    # Example:
    #
    # The clock whispered.
    #
    # clock -> nsubj -> whispered
    # ------------------------------------------

    for child in token.children:

        if child.dep_ in {
            "nsubj",
            "nsubjpass"
        }:

            subject = child
            break


    # ------------------------------------------
    # PATH 2
    #
    # Shared subject through coordinated verb.
    #
    # Example:
    #
    # Arin entered and said something.
    #
    # Arin -> nsubj -> entered
    # entered -> conj -> said
    #
    # The subject of the governing verb
    # is therefore also the structural
    # participant of the dialogue verb.
    # ------------------------------------------

    if subject is None and token.dep_ == "conj":

        governing_verb = token.head


        for child in governing_verb.children:

            if child.dep_ in {
                "nsubj",
                "nsubjpass"
            }:

                subject = child
                break


    if subject is None:
        continue


    dialogue_participants.append({
        "entity": subject.text,
        "verb": token.text,
        "token_index": subject.i
    })


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for participant in dialogue_participants:

    print(
        f"ENTITY: {participant['entity']}"
    )

    print(
        f"  DIALOGUE VERB: {participant['verb']}"
    )

    print(
        f"  TOKEN INDEX: {participant['token_index']}"
    )

    print()


# ==========================================
# COMMUNICATION SENSOR
# ==========================================

print("\n=== COMMUNICATION SENSOR ===\n")


communication_observations = []


communication_verbs = {
    "say",
    "tell",
    "ask",
    "reply",
    "answer",
    "shout",
    "whisper",
    "cry",
    "call",
    "speak"
}


communication_related_dependencies = {
    "dobj",
    "dative",
    "pobj"
}


for token in doc:

    if token.lemma_.lower() not in communication_verbs:
        continue


    # ------------------------------------------
    # SPEAKER / COMMUNICATOR
    # ------------------------------------------

    subject = None


    for child in token.children:

        if child.dep_ in {
            "nsubj",
            "nsubjpass"
        }:

            subject = child

            break


    if subject is None:
        continue


    # ------------------------------------------
    # COMMUNICATION ACTION
    # ------------------------------------------

    communication_observations.append({

        "entity": subject.text,

        "verb": token.text,

        "related_entity": None,

        "relation": None,

        "preposition": None,

        "token_index": subject.i,

        "related_token_index": None

    })


    # ------------------------------------------
    # RELATED COMMUNICATION ELEMENTS
    # ------------------------------------------

    for child in token.children:

        if child.dep_ not in communication_related_dependencies:
            continue


        preposition = None


        if child.dep_ == "pobj":

            for prep in token.children:

                if prep.dep_ != "prep":
                    continue


                for prep_child in prep.children:

                    if prep_child.i == child.i:

                        preposition = prep.text

                        break


                if preposition is not None:
                    break


        communication_observations.append({

            "entity": subject.text,

            "verb": token.text,

            "related_entity": child.text,

            "relation": child.dep_,

            "preposition": preposition,

            "token_index": subject.i,

            "related_token_index": child.i

        })


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for observation in communication_observations:

    print(
        f"ENTITY: "
        f"{observation['entity']}"
    )

    print(
        f"  COMMUNICATION VERB: "
        f"{observation['verb']}"
    )


    if observation["related_entity"] is not None:

        print(
            f"  RELATED ENTITY: "
            f"{observation['related_entity']}"
        )

        print(
            f"  RELATION: "
            f"{observation['relation']}"
        )


        if observation["preposition"] is not None:

            print(
                f"  PREPOSITION: "
                f"{observation['preposition']}"
            )


    print(
        f"  TOKEN INDEX: "
        f"{observation['token_index']}"
    )


    if observation["related_token_index"] is not None:

        print(
            f"  RELATED TOKEN INDEX: "
            f"{observation['related_token_index']}"
        )


    print()

# ==========================================
# ENTITY RELATION SENSOR
# ==========================================

print("\n=== ENTITY RELATION SENSOR ===\n")


def resolve_relation_entity_span(
    token,
    span_records
):
    """
    Restore the full entity expression
    from the existing Span Layer.

    The Relation Sensor only knows the
    syntactic head token.

    Examples:

        Sword   -> Sword of Lirael
        Aeloria -> Castle Aeloria
        Malakar -> Malakar

    The Relation Sensor does not decide
    what the entity is.
    """

    matching_spans = []

    for span in span_records:

        start = span.get("start")
        end = span.get("end")

        if start is None or end is None:
            continue

        if start <= token.i < end:
            matching_spans.append(span)

    if not matching_spans:
        return token.text

    matching_spans.sort(
        key=lambda span:
            (
                span["end"] - span["start"],
                span["start"]
            )
    )

    return matching_spans[0]["text"]


entity_relation_observations = []


for token in doc:

    if token.pos_ != "VERB":
        continue


    # --------------------------------------
    # FIND SUBJECT
    # --------------------------------------

    subject = None

    for child in token.children:

        if child.dep_ in {
            "nsubj",
            "nsubjpass"
        }:

            subject = child
            break


    if subject is None:
        continue


    # --------------------------------------
    # RESOLVE SUBJECT SPAN
    # --------------------------------------

    subject_text = resolve_relation_entity_span(
        subject,
        span_records
    )


    # --------------------------------------
    # DIRECT OBJECT
    # --------------------------------------

    object_token = None

    for child in token.children:

        if child.dep_ in {
            "dobj",
            "obj"
        }:

            object_token = child
            break


    object_text = None

    if object_token is not None:

        object_text = resolve_relation_entity_span(
            object_token,
            span_records
        )


        entity_relation_observations.append({
            "subject": subject_text,
            "subject_token": subject.text,

            "verb": token.text,

            "relation": "DIRECT_OBJECT",

            "preposition": None,

            "target": object_text,
            "target_token": object_token.text,

            "relation_type": (
                "PASSIVE"
                if subject.dep_ == "nsubjpass"
                else "ACTIVE"
            ),

            "token_index": token.i,

            "subject_token_index": subject.i,

            "target_token_index": object_token.i,

        })


    # --------------------------------------
    # PREPOSITIONAL RELATIONS
    # --------------------------------------

    for prep in token.children:

        if prep.dep_ != "prep":
            continue


        prep_object = None

        for child in prep.children:

            if child.dep_ == "pobj":

                prep_object = child
                break


        if prep_object is None:
            continue


        prep_object_text = (
            resolve_relation_entity_span(
                prep_object,
                span_records
            )
        )


        entity_relation_observations.append({
            "subject": subject_text,
            "subject_token": subject.text,

            "verb": token.text,

            "relation": "PREPOSITIONAL",

            "preposition": prep.text,

            "target": prep_object_text,
            "target_token": prep_object.text,

            "relation_type": (
                "PASSIVE"
                if subject.dep_ == "nsubjpass"
                else "ACTIVE"
            ),

            "token_index": token.i,

            "subject_token_index": subject.i,

            "target_token_index": prep_object.i,

        })


    # --------------------------------------
    # PASSIVE AGENT
    # --------------------------------------

    if subject.dep_ == "nsubjpass":

        passive_agent = None

        for child in token.children:

            if child.dep_ != "agent":
                continue

            for agent_child in child.children:

                if agent_child.dep_ == "pobj":

                    passive_agent = agent_child
                    break

            if passive_agent is not None:
                break


        if passive_agent is not None:

            passive_agent_text = (
                resolve_relation_entity_span(
                    passive_agent,
                    span_records
                )
            )


            entity_relation_observations.append({
                "subject": subject_text,
                "subject_token": subject.text,

                "verb": token.text,

                "relation": "PASSIVE_AGENT",

                "preposition": "by",

                "target": passive_agent_text,
                "target_token": passive_agent.text,

                "relation_type": "PASSIVE",

                "token_index": token.i,

                "subject_token_index": subject.i,

                "target_token_index": passive_agent.i,

            })


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for observation in entity_relation_observations:

    print(
        f"SUBJECT: "
        f"{observation['subject']}"
    )

    print(
        f"  SUBJECT TOKEN: "
        f"{observation['subject_token']}"
    )

    print(
        f"  VERB: "
        f"{observation['verb']}"
    )

    print(
        f"  RELATION: "
        f"{observation['relation']}"
    )

    print(
        f"  PREPOSITION: "
        f"{observation['preposition']}"
    )

    print(
        f"  TARGET: "
        f"{observation['target']}"
    )

    print(
        f"  TARGET TOKEN: "
        f"{observation['target_token']}"
    )

    print(
        f"  RELATION TYPE: "
        f"{observation['relation_type']}"
    )

    print(
        f"  TOKEN INDEX: "
        f"{observation['token_index']}"
    )

    print(
        f"  SUBJECT TOKEN INDEX: "
        f"{observation['subject_token_index']}"
    )

    print(
        f"  TARGET TOKEN INDEX: "
        f"{observation['target_token_index']}"
    )

    print()

# ==========================================
# COMMUNICATION SEMANTIC INTERPRETER
# ==========================================

print("\n=== COMMUNICATION SEMANTIC INTERPRETER ===\n")


communication_semantic_observations = []


for observation in communication_observations:

    role = "UNKNOWN"


    # ------------------------------------------
    # RECIPIENT BY DATIVE
    # ------------------------------------------

    if observation["relation"] == "dative":

        role = "RECIPIENT"


    # ------------------------------------------
    # RECIPIENT BY "TO"
    # ------------------------------------------

    elif (
        observation["relation"] == "pobj"
        and observation["preposition"] is not None
        and observation["preposition"].lower() == "to"
    ):

        role = "RECIPIENT"


    # ------------------------------------------
    # SEMANTIC OBSERVATION
    # ------------------------------------------

    communication_semantic_observations.append({

        "entity": observation["entity"],

        "verb": observation["verb"],

        "related_entity": observation["related_entity"],

        "relation": observation["relation"],

        "preposition": observation["preposition"],

        "role": role,

        "token_index": observation["token_index"],

        "related_token_index": observation[
            "related_token_index"
        ]

    })


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for observation in communication_semantic_observations:

    print(
        f"ENTITY: "
        f"{observation['entity']}"
    )

    print(
        f"  COMMUNICATION VERB: "
        f"{observation['verb']}"
    )


    if observation["related_entity"] is not None:

        print(
            f"  RELATED ENTITY: "
            f"{observation['related_entity']}"
        )

        print(
            f"  RELATION: "
            f"{observation['relation']}"
        )


        if observation["preposition"] is not None:

            print(
                f"  PREPOSITION: "
                f"{observation['preposition']}"
            )


        print(
            f"  SEMANTIC ROLE: "
            f"{observation['role']}"
        )


    else:

        print(
            f"  SEMANTIC ROLE: "
            f"{observation['role']}"
        )


    print(
        f"  TOKEN INDEX: "
        f"{observation['token_index']}"
    )


    if observation["related_token_index"] is not None:

        print(
            f"  RELATED TOKEN INDEX: "
            f"{observation['related_token_index']}"
        )


    print()

# ==========================================
# NAMED ROLE SENSOR
# ==========================================

print("\n=== NAMED ROLE SENSOR ===\n")


named_role_observations = []


for token in doc:

    # Ищем конструкции вида:
    #
    # description → named → entity
    #
    # Например:
    #
    # blacksmith → named → Kaelan
    # sorcerer → named → Malakar

    if token.lemma_.lower() != "name":
        continue

    if token.dep_ != "acl":
        continue


    description = token.head

    named_entity = None


    for child in token.children:

        if child.dep_ == "oprd":

            named_entity = child

            break


    if named_entity is None:
        continue


    named_role_observations.append({
        "entity": named_entity.text,
        "role": description.text,
        "token_index": named_entity.i
    })


for item in named_role_observations:

    print(
        f"ENTITY: "
        f"{item['entity']}"
    )

    print(
        f"  NAMED ROLE: "
        f"{item['role']}"
    )

    print(
        f"  TOKEN INDEX: "
        f"{item['token_index']}"
    )

    print()


# ==========================================
# EVIDENCE RECORDS
# ==========================================

print("\n=== EVIDENCE RECORDS ===\n")


evidence_records = []


def add_evidence(
    entity,
    source,
    observation,
    hypothesis,
    direction,
    strength,
    token_index=None,
    span_start=None,
    span_end=None
):

    valid_hypotheses = {
        "CHARACTER",
        "OBJECT",
        "LOCATION",
        "ORGANIZATION",
        "VEHICLE",
        "CREATURE"
    }

    valid_directions = {
        "SUPPORTS",
        "CONTRADICTS",
        "NEUTRAL",
        "UNKNOWN"
    }

    valid_strengths = {
        "STRONG",
        "WEAK"
    }


    if hypothesis not in valid_hypotheses:

        raise ValueError(
            f"Invalid evidence hypothesis: "
            f"{hypothesis}"
        )


    if direction not in valid_directions:

        raise ValueError(
            f"Invalid evidence direction: "
            f"{direction}"
        )


    if strength not in valid_strengths:

        raise ValueError(
            f"Invalid evidence strength: "
            f"{strength}"
        )


    evidence = {
        "entity": entity,
        "source": source,
        "observation": observation,
        "hypothesis": hypothesis,
        "direction": direction,
        "strength": strength,
        "token_index": token_index,
        "span_start": span_start,
        "span_end": span_end
    }


    evidence_records.append(
        evidence
    )


    return evidence


# ==========================================
# EVIDENCE MAPPING
# ==========================================

print("\n=== EVIDENCE MAPPING ===\n")


# ------------------------------------------
# SEMANTIC MARKERS
# ------------------------------------------

location_markers = set()


object_markers = set()


# ------------------------------------------
# DIALOGUE ENTITIES
# ------------------------------------------

dialogue_entities = {
    participant["entity"]
    for participant in dialogue_participants
}


# ==========================================
# SPAN EVIDENCE MAPPING
# ==========================================

for observation in span_observations:

    kind = observation["kind"]

    # --------------------------------------
    # COMPOUND / AMOD
    # --------------------------------------

    if kind in {"compound", "amod"}:

        modifier = (
            observation["parts"]["modifier"]
            .lower()
        )

        head = (
            observation["parts"]["head"]
            .lower()
        )

        if modifier in location_markers:

            add_evidence(
                entity=observation["text"],
                source="span",
                observation="SPAN_LOCATION_MARKER",
                hypothesis="LOCATION",
                direction="SUPPORTS",
                strength="WEAK",
                token_index=observation["start"],
                span_start=observation["start"],
                span_end=observation["end"]
            )

        elif head in location_markers:

            add_evidence(
                entity=observation["text"],
                source="span",
                observation="SPAN_LOCATION_MARKER",
                hypothesis="LOCATION",
                direction="SUPPORTS",
                strength="WEAK",
                token_index=observation["start"],
                span_start=observation["start"],
                span_end=observation["end"]
            )

        if modifier in object_markers:

            add_evidence(
                entity=observation["text"],
                source="span",
                observation="SPAN_OBJECT_MARKER",
                hypothesis="OBJECT",
                direction="SUPPORTS",
                strength="WEAK",
                token_index=observation["start"],
                span_start=observation["start"],
                span_end=observation["end"]
            )

        elif head in object_markers:

            add_evidence(
                entity=observation["text"],
                source="span",
                observation="SPAN_OBJECT_MARKER",
                hypothesis="OBJECT",
                direction="SUPPORTS",
                strength="WEAK",
                token_index=observation["start"],
                span_start=observation["start"],
                span_end=observation["end"]
            )


    # --------------------------------------
    # PREPOSITIONAL
    # --------------------------------------

    elif kind == "prepositional":

        head = (
            observation["parts"]["head"]
            .lower()
        )

        object_word = (
            observation["parts"]["object"]
            .lower()
        )

        if head in location_markers:

            add_evidence(
                entity=observation["text"],
                source="span",
                observation="SPAN_LOCATION_MARKER",
                hypothesis="LOCATION",
                direction="SUPPORTS",
                strength="WEAK",
                token_index=observation["start"],
                span_start=observation["start"],
                span_end=observation["end"]
            )

        if head in object_markers:

            add_evidence(
                entity=observation["text"],
                source="span",
                observation="SPAN_OBJECT_MARKER",
                hypothesis="OBJECT",
                direction="SUPPORTS",
                strength="WEAK",
                token_index=observation["start"],
                span_start=observation["start"],
                span_end=observation["end"]
            )

# ------------------------------------------
# EVIDENCE MAPPING
# ------------------------------------------

for name, profile in entity_profiles.items():

    token = None

    for candidate_token in doc:

        if candidate_token.text == name:

            token = candidate_token

            break


    if token is None:

        continue


    # ======================================
    # CHARACTER EVIDENCE
    # ======================================

    character_observations = []


    if "PERSON" in profile["ner"]:

        character_observations.append(
            "NER_PERSON"
        )


    if profile["acts"]:

        character_observations.append(
            "PERFORMS_ACTION"
        )


    if name in dialogue_entities:

        character_observations.append(
            "DIALOGUE_PARTICIPANT"
        )


    # ==================================
    # NAMED ROLE OBSERVATION
    # ==================================

    named_roles = [
        item["role"]
        for item in named_role_observations
        if item["entity"] == name
    ]


    if named_roles:

        character_observations.append(
            "NAMED_ROLE"
        )


    if character_observations:

        for observation in character_observations:

            if observation == "NER_PERSON":

                direction = "SUPPORTS"
                strength = "STRONG"


            elif observation == "PERFORMS_ACTION":

                # Performing an action is only
                # a raw observation.
                #
                # It does not prove CHARACTER
                # by itself.

                direction = "NEUTRAL"
                strength = "WEAK"


            elif observation == "NAMED_ROLE":

                # Explicit role-name construction is strong character evidence.

                direction = "SUPPORTS"
                strength = "STRONG"


            else:

                direction = "NEUTRAL"
                strength = "WEAK"


            add_evidence(
                entity=name,
                source="evidence_mapping",
                observation=observation,
                hypothesis="CHARACTER",
                direction=direction,
                strength=strength,
                token_index=token.i
            )


    # ======================================
    # LOCATION EVIDENCE
    # ======================================

    location_observations = []


    if (
        "GPE" in profile["ner"]
        or "LOC" in profile["ner"]
    ):

        location_observations.append(
            "NER_LOCATION"
        )


    semantic = semantic_context.get(
        name,
        {}
    )


    semantic_values = set()


    for value in semantic.get(
        "modifiers",
        set()
    ):

        semantic_values.add(
            value.lower()
        )


    for value in semantic.get(
        "appositions",
        set()
    ):

        semantic_values.add(
            value.lower()
        )


    if (
        semantic_values
        & location_markers
    ):

        location_observations.append(
            "LOCATION_SEMANTIC_MARKER"
        )


    if location_observations:

        for observation in location_observations:

            if observation == "NER_LOCATION":

                strength = "STRONG"


            else:

                strength = "WEAK"


            add_evidence(
                entity=name,
                source="evidence_mapping",
                observation=observation,
                hypothesis="LOCATION",
                direction="SUPPORTS",
                strength=strength,
                token_index=token.i
            )


    # ======================================
    # OBJECT EVIDENCE
    # ======================================

    object_observations = []


    if "FAC" in profile["ner"]:

        object_observations.append(
            "NER_FACILITY_OR_OBJECT"
        )


    semantic_object_values = set()


    semantic_object_values.add(
        name.lower()
    )


    for value in semantic.get(
        "modifiers",
        set()
    ):

        semantic_object_values.add(
            value.lower()
        )


    for value in semantic.get(
        "appositions",
        set()
    ):

        semantic_object_values.add(
            value.lower()
        )


    if (
        semantic_object_values
        & object_markers
    ):

        object_observations.append(
            "OBJECT_SEMANTIC_MARKER"
        )


    if object_observations:

        for observation in object_observations:

            if observation == "NER_FACILITY_OR_OBJECT":

                strength = "STRONG"


            else:

                strength = "WEAK"


            add_evidence(
                entity=name,
                source="evidence_mapping",
                observation=observation,
                hypothesis="OBJECT",
                direction="SUPPORTS",
                strength=strength,
                token_index=token.i
            )


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for evidence in evidence_records:

    if evidence["source"] != "evidence_mapping":

        continue


    print(
        f"ENTITY: "
        f"{evidence['entity']}"
    )

    print(
        f"  SOURCE: "
        f"{evidence['source']}"
    )

    print(
        f"  OBSERVATION: "
        f"{evidence['observation']}"
    )

    print(
        f"  HYPOTHESIS: "
        f"{evidence['hypothesis']}"
    )

    print(
        f"  DIRECTION: "
        f"{evidence['direction']}"
    )

    print(
        f"  STRENGTH: "
        f"{evidence['strength']}"
    )

    print(
        f"  TOKEN INDEX: "
        f"{evidence['token_index']}"
    )

    print()


# ==========================================
# HYPOTHESIS CANDIDATE BUILDER
# ==========================================

print("\n=== HYPOTHESIS CANDIDATE BUILDER ===\n")


hypothesis_candidates = {}


for evidence in evidence_records:

    entity = evidence["entity"]

    span_start = evidence["span_start"]
    span_end = evidence["span_end"]

    hypothesis = evidence["hypothesis"]


    key = (
        entity,
        span_start,
        span_end
    )


    if key not in hypothesis_candidates:

        hypothesis_candidates[key] = {
            "entity": entity,
            "span_start": span_start,
            "span_end": span_end,
            "hypotheses": set()
        }


    hypothesis_candidates[key][
        "hypotheses"
    ].add(
        hypothesis
    )


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for key, group in hypothesis_candidates.items():

    print(
        f"ENTITY: "
        f"{group['entity']}"
    )

    print(
        f"SPAN: "
        f"{group['span_start']}:"
        f"{group['span_end']}"
    )

    print("  CANDIDATES:")


    for hypothesis in sorted(
        group["hypotheses"]
    ):

        print(
            f"    - "
            f"{hypothesis}"
        )


    print()



# ==========================================
# EVIDENCE AGGREGATION
# ==========================================

print("\n=== EVIDENCE AGGREGATION ===\n")


evidence_aggregation = {}


for evidence in evidence_records:

    entity = evidence["entity"]

    span_start = evidence["span_start"]
    span_end = evidence["span_end"]

    key = (
        entity,
        span_start,
        span_end
    )


    if key not in evidence_aggregation:

        evidence_aggregation[key] = {
            "entity": entity,
            "span_start": span_start,
            "span_end": span_end,
            "evidence": []
        }


    evidence_aggregation[key]["evidence"].append(
        evidence
    )


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for key, group in evidence_aggregation.items():

    print(
        f"ENTITY: "
        f"{group['entity']}"
    )

    print(
        f"SPAN: "
        f"{group['span_start']}:"
        f"{group['span_end']}"
    )

    print("  EVIDENCE:")


    for evidence in group["evidence"]:

        print(
            f"    SOURCE: "
            f"{evidence['source']}"
        )

        print(
            f"    OBSERVATION: "
            f"{evidence['observation']}"
        )

        print(
            f"    HYPOTHESIS: "
            f"{evidence['hypothesis']}"
        )

        print(
            f"    DIRECTION: "
            f"{evidence['direction']}"
        )

        print(
            f"    STRENGTH: "
            f"{evidence['strength']}"
        )

        print()


# ==========================================
# HYPOTHESIS AGGREGATION
# ==========================================

print("\n=== HYPOTHESIS AGGREGATION ===\n")


hypothesis_aggregation = {}


for key, group in evidence_aggregation.items():

    entity = group["entity"]
    span_start = group["span_start"]
    span_end = group["span_end"]

    group_key = (
        entity,
        span_start,
        span_end
    )


    if group_key not in hypothesis_aggregation:

        hypothesis_aggregation[group_key] = {
            "entity": entity,
            "span_start": span_start,
            "span_end": span_end,
            "hypotheses": {}
        }


    hypotheses = (
        hypothesis_aggregation[group_key]["hypotheses"]
    )


    for evidence in group["evidence"]:

        hypothesis = evidence["hypothesis"]


        if hypothesis not in hypotheses:

            hypotheses[hypothesis] = []


        hypotheses[hypothesis].append(
            evidence
        )


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for key, group in hypothesis_aggregation.items():

    print(
        f"ENTITY: "
        f"{group['entity']}"
    )

    print(
        f"SPAN: "
        f"{group['span_start']}:"
        f"{group['span_end']}"
    )

    print("  HYPOTHESES:")


    for hypothesis, evidence_list in (
        group["hypotheses"].items()
    ):

        print(
            f"    HYPOTHESIS: "
            f"{hypothesis}"
        )

        for evidence in evidence_list:

            print(
                f"      SOURCE: "
                f"{evidence['source']}"
            )

            print(
                f"      OBSERVATION: "
                f"{evidence['observation']}"
            )

            print(
                f"      DIRECTION: "
                f"{evidence['direction']}"
            )

            print(
                f"      STRENGTH: "
                f"{evidence['strength']}"
            )

        print()


# ==========================================
# HYPOTHESIS EVIDENCE SUMMARY
# ==========================================

print("\n=== HYPOTHESIS EVIDENCE SUMMARY ===\n")


hypothesis_evidence_summary = {}


for key, group in hypothesis_aggregation.items():

    entity = group["entity"]
    span_start = group["span_start"]
    span_end = group["span_end"]

    group_key = (
        entity,
        span_start,
        span_end
    )


    hypothesis_evidence_summary[group_key] = {
        "entity": entity,
        "span_start": span_start,
        "span_end": span_end,
        "hypotheses": {}
    }


    for hypothesis, evidence_list in (
        group["hypotheses"].items()
    ):

        summary = {
            "SUPPORTS": [],
            "CONTRADICTS": [],
            "NEUTRAL": [],
            "UNKNOWN": []
        }


        for evidence in evidence_list:

            direction = evidence["direction"]

            summary[direction].append(
                evidence
            )


        hypothesis_evidence_summary[group_key][
            "hypotheses"
        ][hypothesis] = summary


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for key, group in hypothesis_evidence_summary.items():

    print(
        f"ENTITY: "
        f"{group['entity']}"
    )

    print(
        f"SPAN: "
        f"{group['span_start']}:"
        f"{group['span_end']}"
    )

    print("  HYPOTHESES:")


    for hypothesis, summary in (
        group["hypotheses"].items()
    ):

        print(
            f"    HYPOTHESIS: "
            f"{hypothesis}"
        )


        for direction in [
            "SUPPORTS",
            "CONTRADICTS",
            "NEUTRAL",
            "UNKNOWN"
        ]:

            evidence_list = summary[direction]


            print(
                f"      {direction}: "
                f"{len(evidence_list)}"
            )


        print()


# ==========================================
# HYPOTHESIS STATUS DETECTION
# ==========================================

print("\n=== HYPOTHESIS STATUS DETECTION ===\n")


hypothesis_status = {}


for key, group in hypothesis_evidence_summary.items():

    entity = group["entity"]
    span_start = group["span_start"]
    span_end = group["span_end"]

    group_key = (
        entity,
        span_start,
        span_end
    )


    hypothesis_status[group_key] = {
        "entity": entity,
        "span_start": span_start,
        "span_end": span_end,
        "hypotheses": {}
    }


    for hypothesis, summary in (
        group["hypotheses"].items()
    ):

        supports = len(
            summary["SUPPORTS"]
        )

        contradicts = len(
            summary["CONTRADICTS"]
        )

        neutral = len(
            summary["NEUTRAL"]
        )

        unknown = len(
            summary["UNKNOWN"]
        )


        if supports > 0 and contradicts > 0:

            status = "MIXED"

        elif supports > 0:

            status = "SUPPORTED"

        elif contradicts > 0:

            status = "CONTRADICTED"

        else:

            status = "UNRESOLVED"


        hypothesis_status[group_key][
            "hypotheses"
        ][hypothesis] = {

            "status": status,

            "supports": supports,

            "contradicts": contradicts,

            "neutral": neutral,

            "unknown": unknown

        }


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for key, group in hypothesis_status.items():

    print(
        f"ENTITY: "
        f"{group['entity']}"
    )

    print(
        f"SPAN: "
        f"{group['span_start']}:"
        f"{group['span_end']}"
    )

    print("  HYPOTHESES:")


    for hypothesis, data in (
        group["hypotheses"].items()
    ):

        print(
            f"    HYPOTHESIS: "
            f"{hypothesis}"
        )

        print(
            f"      STATUS: "
            f"{data['status']}"
        )

        print(
            f"      SUPPORTS: "
            f"{data['supports']}"
        )

        print(
            f"      CONTRADICTS: "
            f"{data['contradicts']}"
        )

        print(
            f"      NEUTRAL: "
            f"{data['neutral']}"
        )

        print(
            f"      UNKNOWN: "
            f"{data['unknown']}"
        )

        print()


# ==========================================
# HYPOTHESIS COMPARISON
# ==========================================

print("\n=== HYPOTHESIS COMPARISON ===\n")


hypothesis_comparison = {}


for key, group in hypothesis_status.items():

    entity = group["entity"]
    span_start = group["span_start"]
    span_end = group["span_end"]

    group_key = (
        entity,
        span_start,
        span_end
    )


    hypotheses = list(
        group["hypotheses"].keys()
    )


    hypothesis_comparison[group_key] = {

        "entity": entity,

        "span_start": span_start,

        "span_end": span_end,

        "hypotheses": hypotheses

    }


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for key, group in hypothesis_comparison.items():

    print(
        f"ENTITY: "
        f"{group['entity']}"
    )

    print(
        f"SPAN: "
        f"{group['span_start']}:"
        f"{group['span_end']}"
    )

    print("  COMPETING HYPOTHESES:")


    for hypothesis in group["hypotheses"]:

        print(
            f"    - "
            f"{hypothesis}"
        )


    if len(group["hypotheses"]) > 1:

        print(
            "  RELATION: COMPETING"
        )

    else:

        print(
            "  RELATION: SINGLE"
        )


    print()


# ==========================================
# RESOLUTION
# ==========================================

print("\n=== RESOLUTION ===\n")


resolution = {}


for key, group in hypothesis_comparison.items():

    entity = group["entity"]
    span_start = group["span_start"]
    span_end = group["span_end"]

    hypotheses = group["hypotheses"]


    status_group = hypothesis_status[key]


    supported = []
    conflicted = []


    for hypothesis in hypotheses:

        data = status_group["hypotheses"][
            hypothesis
        ]


        if data["status"] == "SUPPORTED":

            supported.append(
                hypothesis
            )


        if data["status"] == "MIXED":

            conflicted.append(
                hypothesis
            )


    conflict = len(
        conflicted
    ) > 0


    if len(supported) == 1:

        final_status = "RESOLVED"
        final_type = supported[0]

    elif len(supported) > 1:

        final_status = "AMBIGUOUS"
        final_type = None

    else:

        final_status = "UNKNOWN"
        final_type = None


    resolution[key] = {

        "entity": entity,

        "span_start": span_start,

        "span_end": span_end,

        "status": final_status,

        "type": final_type,

        "conflict": conflict,

        "candidates": list(hypotheses)

    }

# ==========================================
# CHARACTER AGENCY DIAGNOSTIC TEST
# ==========================================

print("\n=== CHARACTER AGENCY DIAGNOSTIC ===\n")

agency_test_entities = [
    "Kaelan",
    "Lira",
    "Malakar",
    "Queen Elara",
    "Ruins",
    "wind",
    "trees"
]

for name in agency_test_entities:

    if name not in entity_profiles:
        print(f"ENTITY: {name}")
        print("  NOT FOUND IN ENTITY PROFILES")
        print()
        continue

    profile = entity_profiles[name]

    print(f"ENTITY: {name}")

    matching_sentences = []

    for sentence in doc.sents:

        if any(
            token.text == name
            for token in sentence
        ):
            matching_sentences.append(
                sentence.text.strip()
            )

    print(
        "  SENTENCES:"
    )

    for sentence in matching_sentences:

        print(
            f"    - {sentence}"
        )

    print(
        f"  MENTIONS: "
        f"{profile['mentions']}"
    )

    print(
        f"  PERSON_NER: "
        f"{'PERSON' in profile['ner']}"
    )

    print(
        f"  SUBJECT_ROLE: "
        f"{'nsubj' in profile['dependencies'] or 'nsubjpass' in profile['dependencies']}"
    )

    print(
        f"  ACTS: "
        f"{len(profile['acts'])}"
    )

    print(
        f"  ACTED_ON_BY: "
        f"{len(profile['acted_on_by'])}"
    )

    print(
        f"  DIALOGUE_PARTICIPANT: "
        f"{name in dialogue_entities}"
    )

    context = semantic_context.get(
        name,
        {}
    )

    print(
        f"  MODIFIERS: "
        f"{sorted(context.get('modifiers', set()))}"
    )

    print(
        f"  APPOSITIONS: "
        f"{sorted(context.get('appositions', set()))}"
    )

    print(
        f"  DESCRIPTIONS: "
        f"{sorted(context.get('descriptions', set()))}"
    )

    print("  TOKEN STRUCTURE:")

    for sentence in matching_sentences:

        for token in doc:

            if (
                token.text == name
                and token.sent.text.strip() == sentence
            ):

                print(
                    f"    {token.text} "
                    f"POS={token.pos_} "
                    f"DEP={token.dep_} "
                    f"HEAD={token.head.text}"
                )

                for child in token.children:

                    print(
                        f"      CHILD: "
                        f"{child.text} "
                        f"POS={child.pos_} "
                        f"DEP={child.dep_} "
                        f"HEAD={child.head.text}"
                    )

                break

    print()


# ==========================================
# DEPENDENCY TREE TEST
# ==========================================

print("\n=== DEPENDENCY TREE TEST ===\n")

test_words = {
    "blacksmith",
    "sorcerer",
    "stronghold"
}

for token in doc:

    if token.text.lower() not in test_words:
        continue

    print(
        f"TOKEN: {token.text}"
    )

    print(
        f"  POS: {token.pos_}"
    )

    print(
        f"  DEP: {token.dep_}"
    )

    print(
        f"  HEAD: {token.head.text}"
    )

    print(
        f"  HEAD_POS: {token.head.pos_}"
    )

    print(
        f"  HEAD_DEP: {token.head.dep_}"
    )

    print(
        "  CHILDREN:"
    )

    for child in token.children:

        print(
            f"    - {child.text} "
            f"POS={child.pos_} "
            f"DEP={child.dep_}"
        )

    print(
        "  SENTENCE:"
    )

    print(
        f"    {token.sent.text.strip()}"
    )

    print()

    # ==========================================
# NAMED RELATION TEST
# ==========================================

print("\n=== NAMED RELATION TEST ===\n")

for token in doc:

    if token.text.lower() != "named":
        continue

    print(
        f"TOKEN: {token.text}"
    )

    print(
        f"  POS: {token.pos_}"
    )

    print(
        f"  DEP: {token.dep_}"
    )

    print(
        f"  HEAD: {token.head.text}"
    )

    print(
        f"  HEAD_POS: {token.head.pos_}"
    )

    print(
        f"  HEAD_DEP: {token.head.dep_}"
    )

    print(
        "  CHILDREN:"
    )

    for child in token.children:

        print(
            f"    - {child.text} "
            f"POS={child.pos_} "
            f"DEP={child.dep_}"
        )

    print(
        "  SENTENCE:"
    )

    print(
        f"    {token.sent.text.strip()}"
    )

    print()

# ==========================================
# NAMED DESCRIPTION TEST
# ==========================================

print("\n=== NAMED DESCRIPTION TEST ===\n")

named_descriptions = []

for token in doc:

    if token.lemma_.lower() != "name":
        continue

    if token.dep_ != "acl":
        continue

    description = token.head

    named_entity = None

    for child in token.children:

        if child.dep_ == "oprd":
            named_entity = child
            break

    if named_entity is None:
        continue

    named_descriptions.append({
        "description": description.text,
        "name": named_entity.text,
        "token_index": named_entity.i
    })


for item in named_descriptions:

    print(
        f"DESCRIPTION: {item['description']}"
    )

    print(
        f"  NAMED ENTITY: {item['name']}"
    )

    print(
        f"  TOKEN INDEX: {item['token_index']}"
    )

    print()


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for key, result in resolution.items():

    print(
        f"ENTITY: "
        f"{result['entity']}"
    )

    print(
        f"SPAN: "
        f"{result['span_start']}:"
        f"{result['span_end']}"
    )

    print(
        f"STATUS: "
        f"{result['status']}"
    )

    print(
        f"TYPE: "
        f"{result['type']}"
    )

    print(
        f"CONFLICT: "
        f"{result['conflict']}"
    )

    print(
        f"CANDIDATES: "
        f"{result['candidates']}"
    )

    print()


