class CharacterDetectionAnalyzer {
    /**
     * Universal character detection based on contextual evidence.
     *
     * The analyzer does NOT assume that every proper name is a character.
     * It collects positive and negative evidence and classifies candidates.
     *
     * @param {Array<{text?: string, content?: string}>} chapters
     * @param {Object} options
     * @returns {{ characters: Array<{name: string}> }}
     */
    static analyze(chapters = [], options = {}) {
        const {
            minFrequency = 2,
            minScore = 4
        } = options;

        if (!Array.isArray(chapters) || chapters.length === 0) {
            return { characters: [] };
        }

        const fullText = chapters
            .map(ch => ch?.text || ch?.content || '')
            .join('\n');

        if (!fullText.trim()) {
            return { characters: [] };
        }

        // ------------------------------------------------------------
        // WORD LISTS
        // ------------------------------------------------------------

        const stopwords = new Set([
            'the', 'a', 'an', 'in', 'on', 'at', 'as', 'with', 'from',
            'for', 'and', 'but', 'or', 'yet', 'when', 'while', 'after',
            'before', 'however', 'together', 'each', 'one', 'it', 'he',
            'she', 'they', 'this', 'that', 'these', 'those', 'some',
            'any', 'no', 'all', 'both', 'neither', 'nor', 'not', 'only',
            'own', 'same', 'so', 'than', 'too', 'very', 'just', 'per',
            'via', 'among', 'between', 'through', 'during', 'without',
            'against', 'along', 'toward', 'upon', 'onto', 'into',
            'within', 'outside', 'beyond', 'there'
        ]);

        /*
         * Words which strongly suggest that a named entity is NOT
         * a human/animal character.
         *
         * IMPORTANT:
         * We deliberately do NOT blacklist words such as "shadow",
         * "angel", "demon", "monster", etc.
         * They can legitimately be character names.
         */
        const objectWords = new Set([
            'sword', 'shield', 'crown', 'ring', 'stone', 'book',
            'map', 'weapon', 'blade', 'armor', 'armour', 'key',
            'staff', 'scroll', 'amulet', 'necklace', 'gem',
            'crystal', 'door', 'gate', 'throne', 'altar',
            'letter', 'document', 'torch', 'lantern', 'machine',
            'device', 'artifact', 'artefact', 'relic'
        ]);

        const locationWords = new Set([
            'city', 'kingdom', 'empire', 'castle', 'village',
            'forest', 'mountain', 'river', 'lake', 'sea', 'ocean',
            'valley', 'island', 'desert', 'capital', 'province',
            'country', 'realm', 'land', 'ruins', 'ruin', 'temple',
            'palace', 'fortress', 'harbor', 'harbour', 'town',
            'road', 'street', 'woods', 'cave', 'dungeon'
        ]);

        const vehicleWords = new Set([
            'ship', 'vessel', 'boat', 'carriage', 'wagon',
            'airship', 'train', 'vehicle'
        ]);

        const roleWords = new Set([
            'king', 'queen', 'prince', 'princess', 'lord', 'lady',
            'knight', 'captain', 'commander', 'general', 'soldier',
            'guard', 'warrior', 'blacksmith', 'sorcerer', 'wizard',
            'mage', 'witch', 'merchant', 'farmer', 'hunter',
            'healer', 'elder', 'hero', 'villain', 'stranger',
            'investigator', 'detective', 'doctor', 'teacher',
            'soldier', 'officer', 'servant', 'priest', 'monk',
            'assassin', 'thief', 'ranger', 'archer'
        ]);

        const animalWords = new Set([
            'dog', 'wolf', 'horse', 'cat', 'bird', 'eagle',
            'lion', 'bear', 'dragon', 'fox', 'deer', 'hound'
        ]);

        /*
         * These are evidence words, NOT a hard-coded definition
         * of what a character is.
         */
        const strongActions = new Set([
            'spoke', 'said', 'asked', 'replied', 'whispered',
            'shouted', 'felt', 'thought', 'remembered', 'believed',
            'wanted', 'needed', 'hoped', 'feared', 'knew',
            'decided', 'choose', 'chose', 'refused', 'accepted', 'promised',
            'attacked', 'fought', 'escaped', 'saved', 'sacrificed',
            'protected', 'confronted', 'faced', 'discovered',
            'found', 'revealed', 'witnessed', 'followed', 'joined',
            'trusted', 'betrayed', 'warned', 'agreed', 'denied',
            'argued', 'replied', 'answered', 'commanded', 'ordered',
            'invited', 'threatened', 'challenged', 'forgave',
            'hated', 'loved', 'feared', 'admired'
        ]);

        const physicalActions = new Set([
            'entered', 'left', 'walked', 'ran', 'looked', 'watched',
            'opened', 'closed', 'turned', 'waited',
            'smiled', 'cried', 'shook', 'prepared', 'returned',
            'held', 'grasped', 'journeyed', 'pledged', 'traversed',
            'awaited', 'unleashed', 'thrust', 'banished', 'forged',
            'carried', 'sought', 'ruled', 'moved', 'approached',
            'stopped', 'started', 'sat', 'rose', 'knelt', 'ran',
            'jumped', 'climbed', 'rode', 'entered', 'departed'
        ]);

        const dialogueVerbs = new Set([
            'said', 'spoke', 'asked', 'replied', 'whispered',
            'shouted', 'answered', 'murmured', 'called',
            'cried', 'exclaimed', 'argued', 'declared'
        ]);

        // ------------------------------------------------------------
        // HELPERS
        // ------------------------------------------------------------

        const cleanName = (raw) => {
            if (!raw) return '';

            return raw
                .trim()
                .replace(/^[^A-Za-z]+/, '')
                .replace(/[^A-Za-z'\-\s]+$/, '')
                .replace(/\s+/g, ' ')
                .trim();
        };

        const isStopword = (word) =>
            stopwords.has(word.toLowerCase());

        const firstWord = (name) =>
            name.split(/\s+/)[0].toLowerCase();

        const lastWord = (name) =>
            name.split(/\s+/).pop().toLowerCase();

        const containsWord = (name, set) =>
            name
                .toLowerCase()
                .split(/[\s\-]+/)
                .some(word => set.has(word));

        const isProperNameFormat = (name) => {
            const parts = name.split(/\s+/);

            return parts.every(part =>
                /^[A-Z][A-Za-z'’-]*$/.test(part)
            );
        };

        // ------------------------------------------------------------
        // CANDIDATE STORAGE
        // ------------------------------------------------------------

        const candidates = new Map();

        const addCandidate = (
            rawName,
            score = 1,
            evidence = '',
            negativeScore = 0,
            negativeEvidence = ''
        ) => {
            const name = cleanName(rawName);

            if (!name) return;
            if (name.length < 2) return;
            if (!isProperNameFormat(name)) return;

            const first = firstWord(name);

            if (isStopword(first)) return;

            const key = name.toLowerCase();

            if (!candidates.has(key)) {
                candidates.set(key, {
                    name,
                    score: 0,
                    negativeScore: 0,
                    evidence: new Set(),
                    negativeEvidence: new Set(),
                    frequency: 0
                });
            }

            const entry = candidates.get(key);

            entry.score += score;
            entry.negativeScore += negativeScore;
            entry.frequency += 1;

            if (evidence) {
                entry.evidence.add(evidence);
            }

            if (negativeEvidence) {
                entry.negativeEvidence.add(negativeEvidence);
            }
        };

        // ------------------------------------------------------------
        // PROPER NAME PATTERN
        // ------------------------------------------------------------

        /*
         * Supports:
         *
         * Kaelan
         * Queen Elara
         * Black Pearl
         * Sword of Dawn
         * Kaelan Darkwood
         * Lirael-Storm
         *
         * We intentionally collect candidates first.
         * Classification happens later.
         */
        const namePattern =
            /\b[A-Z][A-Za-z'’-]*(?:\s+(?:[A-Z][A-Za-z'’-]*|of|the)\b[A-Za-z'’-]*)*/g;

        // ------------------------------------------------------------
        // 1. EXPLICIT PERSON INTRODUCTION
        // ------------------------------------------------------------

        const explicitPattern =
            /\b(?:named|called)\s+([A-Z][A-Za-z'’-]*(?:\s+[A-Z][A-Za-z'’-]*)*)/g;

        let match;

        while ((match = explicitPattern.exec(fullText)) !== null) {
            addCandidate(
                match[1],
                7,
                'explicit_person_introduction'
            );
        }

        // ------------------------------------------------------------
        // 2. TITLE + NAME
        // ------------------------------------------------------------

        const titlePattern =
            /\b(?:King|Queen|Prince|Princess|Lord|Lady|Captain|Commander|General|Duke|Duchess|Count|Countess|Sir|Master)\s+([A-Z][A-Za-z'’-]*(?:\s+[A-Z][A-Za-z'’-]*)*)/g;

        while ((match = titlePattern.exec(fullText)) !== null) {
            addCandidate(
                match[1],
                6,
                'title_person'
            );
        }

        // ------------------------------------------------------------
        // 3. ROLE + NAME
        // ------------------------------------------------------------

        const rolePattern =
            /\b(?:the|a|an)\s+(?:(?:young|old|ancient|former|fierce|royal|unknown|mysterious)\s+)?([a-z]+)\s+([A-Z][A-Za-z'’-]*(?:\s+[A-Z][A-Za-z'’-]*)*)/gi;

        while ((match = rolePattern.exec(fullText)) !== null) {
            const role = match[1].toLowerCase();
            const name = match[2];

            if (roleWords.has(role) || animalWords.has(role)) {
                addCandidate(
                    name,
                    6,
                    'role_person'
                );
            }
        }

        // ------------------------------------------------------------
        // 4. ACTION-BASED EVIDENCE
        // ------------------------------------------------------------

        /*
         * We inspect local sentence context instead of assuming:
         *
         * Name + verb = character.
         *
         * This is important because ships, places and objects can
         * also grammatically perform actions.
         */
        const sentences =
            fullText.match(/[^.!?]+[.!?]+/g) || [fullText];

        for (const sentence of sentences) {
            const names = sentence.match(namePattern) || [];

            for (const rawName of names) {
                const name = cleanName(rawName);

                if (!name) continue;

                const nameIndex =
                    sentence.indexOf(rawName);

                if (nameIndex < 0) continue;

                const before =
                    sentence
                        .slice(
                            Math.max(0, nameIndex - 80),
                            nameIndex
                        )
                        .toLowerCase();

                const after =
                    sentence
                        .slice(
                            nameIndex + rawName.length,
                            nameIndex + rawName.length + 100
                        )
                        .toLowerCase();

                const context = before + ' ' + after;

                const words =
                    context.match(/[a-z]+/g) || [];

                let hasStrongAction = false;
                let hasPhysicalAction = false;
                let hasDialogue = false;

                for (const word of words) {
                    if (strongActions.has(word)) {
                        hasStrongAction = true;
                    }

                    if (physicalActions.has(word)) {
                        hasPhysicalAction = true;
                    }

                    if (dialogueVerbs.has(word)) {
                        hasDialogue = true;
                    }
                }

                if (hasStrongAction) {
                    addCandidate(
                        name,
                        4,
                        'strong_action'
                    );
                }

                if (hasPhysicalAction) {
                    addCandidate(
                        name,
                        2,
                        'physical_action'
                    );
                }

                if (hasDialogue) {
                    addCandidate(
                        name,
                        6,
                        'dialogue'
                    );
                }
            }
        }

        // ------------------------------------------------------------
        // 5. DIRECT ADDRESS / DIALOGUE
        // ------------------------------------------------------------

        const directAddressPattern =
            /\b(?:said|asked|told|called|warned|answered)\s+([A-Z][A-Za-z'’-]*(?:\s+[A-Z][A-Za-z'’-]*)*)/g;

        while ((match = directAddressPattern.exec(fullText)) !== null) {
            addCandidate(
                match[1],
                5,
                'dialogue_interaction'
            );
        }

        // ------------------------------------------------------------
        // 6. ENTITY-TYPE NEGATIVE EVIDENCE
        // ------------------------------------------------------------

        /*
         * We do NOT simply blacklist these names.
         *
         * Instead:
         *
         * "Sword of Dawn" -> strong object evidence
         * "Black Pearl"   -> strong vehicle evidence
         * "Eldoria"       -> location evidence only if context supports it
         *
         * This allows a word such as "Shadow" to remain a legitimate
         * character candidate.
         */

        for (const candidate of candidates.values()) {
            const name = candidate.name;

            if (containsWord(name, objectWords)) {
                candidate.negativeScore += 7;
                candidate.negativeEvidence.add('object_context');
            }

            if (containsWord(name, locationWords)) {
                candidate.negativeScore += 7;
                candidate.negativeEvidence.add('location_context');
            }

            if (containsWord(name, vehicleWords)) {
                candidate.negativeScore += 8;
                candidate.negativeEvidence.add('vehicle_context');
            }
        }

        // ------------------------------------------------------------
        // 7. CONTEXTUAL PHRASES THAT IDENTIFY NON-CHARACTERS
        // ------------------------------------------------------------

        const nonCharacterPatterns = [
            {
                pattern:
                    /\b(?:the|a|an)\s+([A-Z][A-Za-z'’-]*(?:\s+(?:[A-Z][A-Za-z'’-]*|of|the)\b[A-Za-z'’-]*)*)\s+(?:stood|stood beyond|lay|remained|was located|was built|was destroyed)/g,
                score: 4,
                evidence: 'location_or_object_predicate'
            },
            {
                pattern:
                    /\b(?:the|a|an)\s+([A-Z][A-Za-z'’-]*(?:\s+(?:[A-Z][A-Za-z'’-]*|of|the)\b[A-Za-z'’-]*)*)\s+(?:sailed|anchored|docked|departed|returned to the harbor)/g,
                score: 5,
                evidence: 'vehicle_predicate'
            },
            {
                pattern:
                    /\b(?:the|a|an)\s+([A-Z][A-Za-z'’-]*(?:\s+(?:[A-Z][A-Za-z'’-]*|of|the)\b[A-Za-z'’-]*)*)\s+(?:glowed|shone|sparkled|remained on|lay on|was forged)/g,
                score: 5,
                evidence: 'object_predicate'
            }
        ];

        for (const rule of nonCharacterPatterns) {
            while ((match = rule.pattern.exec(fullText)) !== null) {
                const name = match[1];

                addCandidate(
                    name,
                    0,
                    '',
                    rule.score,
                    rule.evidence
                );
            }
        }

        // ------------------------------------------------------------
        // ------------------------------------------------------------
        // 7. LOCATION CONTEXT EVIDENCE
        // ------------------------------------------------------------

        const contextualLocationPattern =
            /\b(?:city|kingdom|empire|castle|village|forest|mountain|river|lake|sea|ocean|valley|island|desert|capital|province|country|realm|land|ruins|ruin|temple|palace|fortress|harbor|harbour|town|road|street|woods|cave|dungeon)\s+of\s+([A-Z][A-Za-z'’-]*(?:\s+[A-Z][A-Za-z'’-]*)*)/g;

        while ((match = contextualLocationPattern.exec(fullText)) !== null) {
            addCandidate(
                match[1],
                0,
               '',
                8,
                'location_context'
           );
        }


        // 8. FREQUENCY AS SUPPORTING EVIDENCE
        // ------------------------------------------------------------

        for (const candidate of candidates.values()) {
            if (candidate.frequency >= minFrequency) {
                candidate.score += Math.min(
                    candidate.frequency,
                    5
                );
                candidate.evidence.add('repeated_reference');
            }
        }

        // ------------------------------------------------------------
        // 9. FINAL CHARACTER CLASSIFICATION
        // ------------------------------------------------------------

        const accepted = [];

        for (const candidate of candidates.values()) {
            const positiveEvidence =
                candidate.evidence;

            const negativeEvidence =
                candidate.negativeEvidence;

            const hasStrongIdentity =
                positiveEvidence.has(
                    'explicit_person_introduction'
                ) ||
                positiveEvidence.has(
                    'title_person'
                ) ||
                positiveEvidence.has(
                    'role_person'
                ) ||
                positiveEvidence.has(
                    'dialogue'
                ) ||
                positiveEvidence.has(
                    'dialogue_interaction'
                );

            const hasAgency =
                positiveEvidence.has(
                    'strong_action'
                ) ||
                positiveEvidence.has(
                    'physical_action'
                );

            const hasRepeatedReference =
                positiveEvidence.has(
                    'repeated_reference'
                );

            const hasNonCharacterEvidence =
                negativeEvidence.size > 0;

            /*
             * Strong negative evidence can reject an entity,
             * unless the text also contains strong explicit
             * person evidence.
             *
             * Example:
             *
             * "The Angel called Shadow..."
             *
             * Shadow should not be rejected merely because
             * "shadow" is a normal noun.
             */
            if (
                hasNonCharacterEvidence &&
                !hasStrongIdentity
            ) {
                continue;
            }

            /*
             * A candidate becomes a character when it has:
             *
             * 1. strong identity evidence, OR
             * 2. agency + repeated reference, OR
             * 3. sufficient combined evidence.
             */
            const qualifies =
                hasStrongIdentity ||
                (hasAgency && hasRepeatedReference) ||
                candidate.score >= minScore;

            if (!qualifies) {
                continue;
            }

            /*
             * If negative evidence substantially outweighs positive
             * evidence and there is no strong identity evidence,
             * reject the candidate.
             */
            if (
                !hasStrongIdentity &&
                candidate.negativeScore >= candidate.score
            ) {
                continue;
            }

            accepted.push({
                name: candidate.name,
                score: candidate.score,
                frequency: candidate.frequency,
                evidence: Array.from(
                    candidate.evidence
                )
            });
        }

        // ------------------------------------------------------------
        // 10. ALIAS / SHORT-LONG NAME MERGING
        // ------------------------------------------------------------

        accepted.sort(
            (a, b) =>
                a.name.length - b.name.length
        );

        const merged = [];
        const used = new Set();

        for (let i = 0; i < accepted.length; i++) {
            if (used.has(i)) continue;

            const base = accepted[i];
            const cluster = [base];

            for (
                let j = i + 1;
                j < accepted.length;
                j++
            ) {
                if (used.has(j)) continue;

                const other = accepted[j];

                const baseFirst =
                    firstWord(base.name);

                const otherFirst =
                    firstWord(other.name);

                const sameFirstName =
                    baseFirst === otherFirst &&
                    baseFirst.length > 2;

                const prefixMatch =
                    other.name.startsWith(
                        base.name + ' '
                    ) ||
                    base.name.startsWith(
                        other.name + ' '
                    );

                if (
                    prefixMatch ||
                    sameFirstName
                ) {
                    cluster.push(other);
                    used.add(j);
                }
            }

            const best =
                cluster.reduce(
                    (a, b) =>
                        b.frequency > a.frequency
                            ? b
                            : a
                );

            merged.push({
                name: best.name,
                frequency: cluster.reduce(
                    (sum, item) =>
                        sum + item.frequency,
                    0
                ),
                score: cluster.reduce(
                    (sum, item) =>
                        sum + item.score,
                    0
                )
            });

            used.add(i);
        }

        // ------------------------------------------------------------
        // 11. FINAL SORT
        // ------------------------------------------------------------

        merged.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            return b.frequency - a.frequency;
        });

        return {
            characters: merged.map(
                candidate => ({
                    name: candidate.name
                })
            )
        };
    }
}

module.exports = CharacterDetectionAnalyzer;
