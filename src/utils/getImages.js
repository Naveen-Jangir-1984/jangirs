const URL = process.env.REACT_APP_API_URL;
const PORT = process.env.REACT_APP_PORT;

/**
 * Fetch member images from server
 * Images are served from public/images/Members/ directory
 * @returns {Promise<Array<{id: number, src: string}>>}
 */
export const fetchMemberImages = async () => {
  try {
    const response = await fetch(`${URL}:${PORT}/getMemberImages`);
    const data = await response.json();

    // Convert relative paths to full URLs
    return (data.images || []).map((img) => ({
      id: img.id,
      src: `${URL}:${PORT}${img.src}`,
    }));
  } catch (error) {
    console.error("Error fetching member images:", error);
    return [];
  }
};

// For backwards compatibility - returns empty array initially
// App.js will fetch the actual images from server
export const IMAGES = [];
