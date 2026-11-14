// Turns the raw CV data into the ordered list of page chapters.
// The epilogue is added here so cv-data.json stays a plain CV.
export function buildChapters(cv) {
  const epilogue = {
    id: 'epilogue',
    title: 'Now',
    years: null,
    role: cv.title,
    outfit: 'best outfit',
    tech: [],
    highlights: cv.certifications,
    links: cv.links,
  };
  return [...cv.chapters, epilogue];
}
