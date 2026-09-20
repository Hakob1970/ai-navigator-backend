import spacy
import json

from tools.entity_lab.semantic_openrouter import (
    SemanticOpenRouterClient
)

nlp = spacy.load("en_core_web_sm")



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
        "text": doc[start:end].text,
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
# UNIVERSAL SEMANTIC INTERPRETER
# ==========================================

print("\n=== UNIVERSAL SEMANTIC INTERPRETER ===\n")


semantic_observations = []



def span_contains(outer, inner):
    return (
        outer["start"] <= inner["start"]
        and outer["end"] >= inner["end"]
        and (
            outer["start"] < inner["start"]
            or outer["end"] > inner["end"]
        )
    )


for span in span_records:

    semantic_features = {}
    basis = []


    # ------------------------------------------
    # NER RELATION
    # ------------------------------------------

    ner_relations = []


    for ent in doc.ents:

        relation = get_span_relation(
            span,
            ent
        )


        if relation is None:
            continue


        ner_relations.append({
            "relation": relation,
            "text": ent.text,
            "label": ent.label_,
            "span": {
                "start": ent.start,
                "end": ent.end
            }
        })


        basis.append({
            "source": "NER",
            "type": "NER_SPAN_RELATION",
            "reference": {
                "relation": relation,
                "start": ent.start,
                "end": ent.end
            }
        })


    if ner_relations:

        semantic_features["ner_relation"] = (
            ner_relations
        )




    # ------------------------------------------
    # STRUCTURAL RELATION
    # ------------------------------------------

    structural_relation = {
        "type": span["kind"]
    }


    if span["kind"] in {
        "compound",
        "amod"
    }:

        structural_relation.update({
            "modifier": span["parts"]["modifier"],
            "head": span["parts"]["head"]
        })


    elif span["kind"] == "prepositional":

        structural_relation.update({
            "head": span["parts"]["head"],
            "preposition": span["parts"]["prep"],
            "object": span["parts"]["object"]
        })


    semantic_features["structural_relation"] = (
        structural_relation
    )


    basis.append({
        "source": "STRUCTURAL_SPAN",
        "type": "STRUCTURAL_SPAN",
        "reference": {
            "start": span["start"],
            "end": span["end"]
        }
    })


    # ------------------------------------------
    # STRUCTURAL CONTAINMENT
    # ------------------------------------------

    containing_spans = [
        outer
        for outer in span_records
        if span_contains(outer, span)
    ]


    if containing_spans:

        most_specific_outer = min(
            containing_spans,
            key=lambda item:
                item["end"] - item["start"]
        )


        semantic_features["contextual_relation"] = {
            "type": "nested_expression",
            "outer_span": {
                "start": most_specific_outer["start"],
                "end": most_specific_outer["end"]
            }
        }


        basis.append({
            "source": "STRUCTURAL_SPAN",
            "type": "CONTAINMENT",
            "reference": {
                "start": most_specific_outer["start"],
                "end": most_specific_outer["end"]
            }
        })


    # ------------------------------------------
    # SEMANTIC CONTEXT
    # ------------------------------------------

    context_parts = []


    for part_name in span["parts"].values():

        if not isinstance(part_name, str):
            continue


        if part_name not in semantic_context:
            continue


        context = semantic_context[part_name]


        context_parts.append({
            "entity": part_name,
            "modifiers": sorted(
                context["modifiers"]
            ),
            "appositions": sorted(
                context["appositions"]
            ),
            "descriptions": sorted(
                context["descriptions"]
            )
        })


    if context_parts:

        semantic_features["contextual_relation"] = (
            semantic_features.get(
                "contextual_relation",
                {}
            )
        )


        semantic_features["contextual_relation"][
            "context_parts"
        ] = context_parts


        basis.append({
            "source": "SEMANTIC_CONTEXT",
            "type": "CONTEXT",
            "reference": {
                "parts": [
                    item["entity"]
                    for item in context_parts
                ]
            }
        })


    # ------------------------------------------
    # RELATIONAL CONTEXT
    # ------------------------------------------

    relational_context = {
        "entity": span["text"],
        "span": {
            "start": span["start"],
            "end": span["end"]
        },
        "relations": []
    }


    # ------------------------------------------
    # EXTERNAL / INTERNAL RELATIONS
    # ------------------------------------------

    span_tokens = list(
        doc[
            span["start"]:
            span["end"]
        ]
    )


    for token in span_tokens:

        head_inside = (
            span["start"]
            <= token.head.i
            <
            span["end"]
        )


        scope = (
            "INTERNAL"
            if head_inside
            else "EXTERNAL"
        )


        relational_context["relations"].append({
            "scope": scope,

            "anchor": {
                "token": token.text,
                "index": token.i
            },

            "relation": {
                "dependency": token.dep_
            },

            "governor": {
                "token": token.head.text,
                "index": token.head.i,
                "lemma": token.head.lemma_,
                "pos": token.head.pos_
            }
        })


    # ------------------------------------------
    # NESTED RELATIONS
    # ------------------------------------------

    containing_spans = [
        outer
        for outer in span_records
        if span_contains(outer, span)
    ]


    for outer in containing_spans:

        for token in span_tokens:

            head_inside_current_span = (
                span["start"]
                <= token.head.i
                <
                span["end"]
            )


            head_inside_outer_span = (
                outer["start"]
                <= token.head.i
                <
                outer["end"]
            )


            if (
                not head_inside_current_span
                and head_inside_outer_span
            ):

                relational_context["relations"].append({
                    "scope": "NESTED",

                    "anchor": {
                        "token": token.text,
                        "index": token.i
                    },

                    "relation": {
                        "dependency": token.dep_
                    },

                    "governor": {
                        "token": token.head.text,
                        "index": token.head.i,
                        "lemma": token.head.lemma_,
                        "pos": token.head.pos_
                    },

                    "containing_span": {
                        "text": outer["text"],
                        "start": outer["start"],
                        "end": outer["end"]
                    }
                })


    semantic_features["relational_context"] = (
        relational_context
    )


    basis.append({
        "source": "RELATIONAL_CONTEXT",
        "type": "RELATIONAL_CONTEXT",
        "reference": {
            "start": span["start"],
            "end": span["end"]
        }
    })


    # ------------------------------------------
    # SEMANTIC OBSERVATION
    # ------------------------------------------

    semantic_observation = {
        "id": (
            f"semantic_obs_"
            f"{len(semantic_observations) + 1:03d}"
        ),

        "entity": span["text"],

        "span": {
            "start": span["start"],
            "end": span["end"]
        },

        "semantic_features": (
            semantic_features
        ),

        "basis": basis,

        "source": sorted({
            item["source"]
            for item in basis
        })
    }


    semantic_observations.append(
        semantic_observation
    )


# ==========================================
# SEMANTIC EVIDENCE INTERPRETER
# ==========================================

print("\n=== SEMANTIC EVIDENCE INTERPRETER ===\n")


semantic_evidence_candidates = []


# ==========================================
# SEMANTIC REASONING PROVIDER
# ==========================================

class SemanticReasoningProvider:
    """
    Semantic reasoning provider.

    Receives a complete semantic observation
    and delegates semantic interpretation to
    the configured reasoning mechanism.

    This provider does NOT:
        - modify the observation
        - create evidence records
        - modify hypotheses
        - perform resolution
        - access protected sensors
        - use entity-name dictionaries
    """

    def __init__(self):

        self.client = SemanticOpenRouterClient()

    def interpret(
        self,
        observation
    ):
        """
        Ask the semantic reasoning provider
        to interpret one complete semantic
        observation.

        The model must return JSON only.
        """

        prompt = f"""
You are a semantic reasoning component inside
an Entity Analysis system.

Your task is to interpret the supplied semantic
observation using the information contained in
the observation.

Important rules:

- Do not use entity-name dictionaries.
- Do not assume that a word implies a semantic type.
- Do not treat NER labels as ground truth.
- Do not invent information that is not present.
- Consider the complete observation, including:
  structural relations,
  semantic context,
  relational context,
  NER information,
  and span boundaries.
- Multiple interpretations are allowed.
- If the information is insufficient, return
  an empty interpretations list.
- Do not perform resolution.
- Do not create evidence records.

Allowed hypotheses:

CHARACTER
OBJECT
LOCATION
ORGANIZATION
VEHICLE
CREATURE

Allowed directions:

SUPPORTS
CONTRADICTS
NEUTRAL
UNKNOWN

Allowed strengths:

STRONG
WEAK

Return JSON only in exactly this structure:

{{
  "interpretations": [
    {{
      "hypothesis": "LOCATION",
      "direction": "SUPPORTS",
      "strength": "WEAK",
      "basis": [
        {{
          "source": "STRUCTURAL_SPAN",
          "type": "STRUCTURAL_SPAN"
        }}
      ]
    }}
  ]
}}

If there is not enough information to support
a semantic interpretation, return:

{{
  "interpretations": []
}}

SEMANTIC OBSERVATION:

{json.dumps(observation, ensure_ascii=False, indent=2)}
"""

        response = self.client.generate(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0
        )

        try:
            data = json.loads(response)
        except json.JSONDecodeError:
            print(
                "SEMANTIC AI INVALID JSON:",
                response
            )
            return []

        interpretations = data.get(
            "interpretations",
            []
        )

        if not isinstance(
            interpretations,
            list
        ):
            return []

        return interpretations


semantic_reasoning_provider = (
    SemanticReasoningProvider()
)

def interpret_semantic_observation(
    observation
):
    """
    Convert a semantic observation into
    evidence candidates.

    This layer does NOT resolve the entity.

    It does NOT directly modify:
        - hypothesis status
        - resolution
        - candidate collector
        - entity relation sensor

    It only interprets the semantic observation
    and prepares candidate evidence.

    No entity-name dictionary is used here.
    No hardcoded lexical marker is used here.
    """

    result = {
        "entity": observation["entity"],

        "span": {
            "start": observation["span"]["start"],
            "end": observation["span"]["end"]
        },

        "interpretations": (
            semantic_reasoning_provider.interpret(
                observation
            )
        ),

        "basis": list(
            observation.get(
                "basis",
                []
            )
        ),

        "source": "semantic_evidence_interpreter"
    }

    return result


# Automatic semantic AI interpretation is disabled.
# Semantic observations remain available for the
# post-resolution AI escalation layer.

semantic_evidence_candidates = []


for candidate in semantic_evidence_candidates:

    print(
        f"ENTITY: "
        f"{candidate['entity']}"
    )

    print(
        f"  SPAN: "
        f"{candidate['span']['start']}"
        f":"
        f"{candidate['span']['end']}"
    )

    print(
        f"  INTERPRETATIONS: "
        f"{candidate['interpretations']}"
    )

    print(
        "  BASIS:"
    )

    for item in candidate["basis"]:

        print(
            f"    {item['source']}"
            f" | {item['type']}"
        )

    print(
        f"  SOURCE: "
        f"{candidate['source']}"
    )

    print()


# ------------------------------------------
# DISPLAY
# ------------------------------------------

for observation in semantic_observations:

    print(
        f"ENTITY: "
        f"{observation['entity']}"
    )

    print(
        f"  SPAN: "
        f"{observation['span']['start']}"
        f":"
        f"{observation['span']['end']}"
    )

    print(
        f"  SEMANTIC FEATURES: "
        f"{observation['semantic_features']}"
    )

    print(
        "  BASIS:"
    )

    for item in observation["basis"]:

        print(
            f"    {item['source']}"
            f" | {item['type']}"
        )

    print(
        f"  SOURCE: "
        f"{observation['source']}"
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

    if (
        token_index is not None
        and span_start is None
        and span_end is None
    ):

        containing_spans = [
            span
            for span in span_records
            if (
                span["start"] <= token_index
                < span["end"]
            )
        ]


        if containing_spans:

            most_specific_span = min(
                containing_spans,
                key=lambda span:
                    span["end"] - span["start"]
            )


            span_start = (
                most_specific_span["start"]
            )

            span_end = (
                most_specific_span["end"]
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


# --------------------------------------
# NER SPAN INDEX
# --------------------------------------

ner_entities_by_token = {}

for ent in doc.ents:

    for token_index in range(
        ent.start,
        ent.end
    ):

        ner_entities_by_token[token_index] = ent


# --------------------------------------
# MENTION-LEVEL EVIDENCE MAPPING
# --------------------------------------
#
# Entity Profile is aggregate-by-name.
#
# Therefore it must NOT be used to recover
# the position of a particular mention.
#
# Mention-level evidence comes from sensors
# that already preserve token/span coordinates:
#
#   - Entity Relation Sensor
#   - Dialogue Participant Sensor
#   - Named Role Sensor
#
# NER span evidence is mapped separately below.
#


# ======================================
# ENTITY RELATION → CHARACTER EVIDENCE
# ======================================

for observation in entity_relation_observations:

    subject = observation["subject"]

    subject_token_index = (
        observation["subject_token_index"]
    )

    add_evidence(

        entity=subject,

        source="evidence_mapping",

        observation="PERFORMS_ACTION",

        hypothesis="CHARACTER",

        direction="NEUTRAL",

        strength="WEAK",

        token_index=subject_token_index

    )


# ======================================
# DIALOGUE PARTICIPANT → CHARACTER
# ======================================

for participant in dialogue_participants:

    add_evidence(

        entity=participant["entity"],

        source="evidence_mapping",

        observation="DIALOGUE_PARTICIPANT",

        hypothesis="CHARACTER",

        direction="NEUTRAL",

        strength="WEAK",

        token_index=participant["token_index"]

    )


# ======================================
# NAMED ROLE → CHARACTER
# ======================================

for observation in named_role_observations:

    add_evidence(

        entity=observation["entity"],

        source="evidence_mapping",

        observation="NAMED_ROLE",

        hypothesis="CHARACTER",

        direction="SUPPORTS",

        strength="STRONG",

        token_index=observation["token_index"]

    )


# ======================================
# SEMANTIC MARKER EVIDENCE
# ======================================
#
# Semantic markers remain observation-based.
#
# They are intentionally empty unless a future
# semantic sensor supplies verified markers.
#
# Do not derive location/object meaning from
# the aggregate Entity Profile.
#

# --------------------------------------
# NER SPAN EVIDENCE
# --------------------------------------

for ent in doc.ents:

    if ent.label_ == "PERSON":

        add_evidence(

            entity=ent.text,

            source="evidence_mapping",

            observation="NER_PERSON",

            hypothesis="CHARACTER",

            direction="SUPPORTS",

            strength="STRONG",

            token_index=ent.start,

            span_start=ent.start,

            span_end=ent.end

        )


    elif ent.label_ in {"GPE", "LOC"}:

        add_evidence(

            entity=ent.text,

            source="evidence_mapping",

            observation="NER_LOCATION",

            hypothesis="LOCATION",

            direction="SUPPORTS",

            strength="STRONG",

            token_index=ent.start,

            span_start=ent.start,

            span_end=ent.end

        )


    elif ent.label_ == "FAC":

        add_evidence(

            entity=ent.text,

            source="evidence_mapping",

            observation="NER_FACILITY_OR_OBJECT",

            hypothesis="OBJECT",

            direction="SUPPORTS",

            strength="STRONG",

            token_index=ent.start,

            span_start=ent.start,

            span_end=ent.end

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
# ==========================================
# REASONING / RESOLUTION PIPELINE
# ==========================================

def run_reasoning_resolution():

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

    return {
        "hypothesis_candidates": hypothesis_candidates,
        "evidence_aggregation": evidence_aggregation,
        "hypothesis_aggregation": hypothesis_aggregation,
        "hypothesis_evidence_summary": hypothesis_evidence_summary,
        "hypothesis_status": hypothesis_status,
        "hypothesis_comparison": hypothesis_comparison,
        "resolution": resolution
    }

reasoning_resolution = run_reasoning_resolution()

hypothesis_candidates = reasoning_resolution[
    "hypothesis_candidates"
]
evidence_aggregation = reasoning_resolution[
    "evidence_aggregation"
]
hypothesis_aggregation = reasoning_resolution[
    "hypothesis_aggregation"
]
hypothesis_evidence_summary = reasoning_resolution[
    "hypothesis_evidence_summary"
]
hypothesis_status = reasoning_resolution[
    "hypothesis_status"
]
hypothesis_comparison = reasoning_resolution[
    "hypothesis_comparison"
]
resolution = reasoning_resolution[
    "resolution"
]


# ==========================================
# AI ESCALATION GATE
# ==========================================

ai_escalation_candidates = []

ai_escalation_skipped = []

for key, result in resolution.items():

    status = result.get("status")
    conflict = result.get("conflict", False)

    hypothesis_group = hypothesis_status.get(
        key,
        {}
    )

    hypotheses_data = hypothesis_group.get(
        "hypotheses",
        {}
    )

    # ------------------------------------------
    # CONFLICT
    # ------------------------------------------

    if conflict:

        ai_escalation_candidates.append({
            "key": key,
            "entity": result.get("entity"),
            "span_start": result.get("span_start"),
            "span_end": result.get("span_end"),
            "status": status,
            "conflict": conflict,
            "candidates": result.get(
                "candidates",
                []
            ),
            "reason": "CONFLICTING_EVIDENCE"
        })

        continue


    # ------------------------------------------
    # AMBIGUOUS
    # ------------------------------------------

    if status == "AMBIGUOUS":

        ai_escalation_candidates.append({
            "key": key,
            "entity": result.get("entity"),
            "span_start": result.get("span_start"),
            "span_end": result.get("span_end"),
            "status": status,
            "conflict": conflict,
            "candidates": result.get(
                "candidates",
                []
            ),
            "reason": "COMPETING_SUPPORTED_HYPOTHESES"
        })

        continue


    # ------------------------------------------
    # UNKNOWN
    # ------------------------------------------

    if status == "UNKNOWN":

        has_directional_evidence = False
        has_neutral_evidence = False
        has_unknown_evidence = False

        for data in hypotheses_data.values():

            supports = data.get(
                "supports",
                0
            )

            contradicts = data.get(
                "contradicts",
                0
            )

            neutral = data.get(
                "neutral",
                0
            )

            unknown = data.get(
                "unknown",
                0
            )

            if supports > 0 or contradicts > 0:
                has_directional_evidence = True

            if neutral > 0:
                has_neutral_evidence = True

            if unknown > 0:
                has_unknown_evidence = True


        # --------------------------------------
        # ONLY NEUTRAL EVIDENCE
        # --------------------------------------

        if (
            not has_directional_evidence
            and has_neutral_evidence
            and not has_unknown_evidence
        ):

            ai_escalation_skipped.append({
                "key": key,
                "entity": result.get("entity"),
                "span_start": result.get(
                    "span_start"
                ),
                "span_end": result.get(
                    "span_end"
                ),
                "status": status,
                "conflict": conflict,
                "candidates": result.get(
                    "candidates",
                    []
                ),
                "reason": "ONLY_NEUTRAL_EVIDENCE"
            })

            continue


        # --------------------------------------
        # OTHER UNKNOWN
        # --------------------------------------

        ai_escalation_candidates.append({
            "key": key,
            "entity": result.get("entity"),
            "span_start": result.get(
                "span_start"
            ),
            "span_end": result.get(
                "span_end"
            ),
            "status": status,
            "conflict": conflict,
            "candidates": result.get(
                "candidates",
                []
            ),
            "reason": "ACTIONABLE_UNCERTAINTY"
        })

print("\n=== AI ESCALATION GATE ===\n")

print(
    "TOTAL RESOLUTION:",
    len(resolution)
)

print(
    "AI ESCALATION CANDIDATES:",
    len(ai_escalation_candidates)
)

for candidate in ai_escalation_candidates:

    print(
        f"  ENTITY: {candidate['entity']}"
    )

    print(
        f"    STATUS: {candidate['status']}"
    )

    print(
        f"    CONFLICT: {candidate['conflict']}"
    )

    print(
        f"    SPAN: "
        f"{candidate['span_start']}:"
        f"{candidate['span_end']}"
    )

    print(
        f"    REASON: {candidate['reason']}"
    )

    print()

print(
    "AI ESCALATION SKIPPED:",
    len(ai_escalation_skipped)
)

for skipped in ai_escalation_skipped:

    print(
        f"  ENTITY: {skipped['entity']}"
    )

    print(
        f"    STATUS: {skipped['status']}"
    )

    print(
        f"    CONFLICT: {skipped['conflict']}"
    )

    print(
        f"    SPAN: "
        f"{skipped['span_start']}:"
        f"{skipped['span_end']}"
    )

    print(
        f"    REASON: {skipped['reason']}"
    )




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


