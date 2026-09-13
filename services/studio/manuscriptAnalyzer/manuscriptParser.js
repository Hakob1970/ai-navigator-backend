class ManuscriptParser {

    static parse(project) {

        const chapters =
            project.chapters || [];


        const results =
            chapters.map(

                (chapter, index) => {

                    const text =
                        chapter.text ||
                        chapter.content ||
                        "";


                    return {

                        chapterId:
                            chapter.id ||
                            chapter.number ||
                            chapter.index ||
                            index + 1,


                        title:
                            chapter.title || "",


                        text,


                        wordCount:
                            text
                                .split(/\s+/)
                                .filter(Boolean)
                                .length

                    };

                }

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
