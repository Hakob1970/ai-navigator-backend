class ManuscriptParser {

    static parse(project) {

        const chapters =
            project.chapters || [];


        const results =
            chapters.map(

                (chapter, index) => ({

                    chapterId:
                        chapter.id ||
                        chapter.number ||
                        index + 1,


                    title:
                        chapter.title || "",


                    text:
                        chapter.text || "",


                    wordCount:
                        (chapter.text || "")
                            .split(/\s+/)
                            .filter(Boolean)
                            .length

                })

            );


        return {

            totalChapters:
                results.length,

            chapters:
                results

        };

    }

}


module.exports = ManuscriptParser;
