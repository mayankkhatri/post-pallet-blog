const HYGRAPH_API_ENDPOINT =
  "https://api-ap-south-1.hygraph.com/v2/clx1deyzk01k407uq72jt6cqq/master";

document.addEventListener("DOMContentLoaded", async () => {
  const trendingPostsContainer = document.querySelector(
    "#trending-posts .posts"
  );
  const allPostsContainer = document.querySelector("#all-posts .posts");
  const searchResultsContainer = document.querySelector(
    "#search-results .posts"
  ); // New container for search results
  const searchBox = document.getElementById("search-box");

  async function fetchPosts(type, page, limit) {
    const query = `
      query {
        posts(orderBy: postNumber_DESC, where: { trending: ${
          type === "trending"
        } }, skip: ${(page - 1) * limit}, first: ${limit}) {
          id
          title
          content {
            html
          }
          imageLink
          postNumber
          trending
          imageLink
          category
          actors
          network
          likes
          views
       
        }
      }
    `;
    try {
      const response = await fetch(HYGRAPH_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      return data.data.posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  }

  async function loadPosts() {
    const trendingPosts = await fetchPosts("trending", 1, 5);
    const allPosts = await fetchPosts("all", 1, 10);

    trendingPostsContainer.innerHTML = "";
    allPostsContainer.innerHTML = "";

    trendingPosts.forEach((post) => {
      const postElement = createPostElement(post);
      trendingPostsContainer.appendChild(postElement);
      // Check if the post is not in the all posts, then add it to all posts
      if (!allPosts.find((item) => item.id === post.id)) {
        allPosts.push(post);
      }
    });

    allPosts.forEach((post) => {
      const postElement = createPostElement(post);
      allPostsContainer.appendChild(postElement);
    });
  }

  function createPostElement(post) {
    const postElement = document.createElement("div");
    postElement.className = "post";
    postElement.innerHTML = `
      <h3>${post.title}</h3>
      <img src="${post.imageLink}" alt="${post.title}">
      <p>${post.content.html}</p>
      <p>Actors: ${post.actors}</p>
      <p>Network: ${post.network}</p>
      <p>Likes: ${post.likes}</p>
      <p>Views: ${post.views}</p>
      <p>Post Number: ${post.postNumber}</p>
      <p>Category: ${post.category}</p>
      <!-- Add any other relevant data fields here -->
    `;
    return postElement;
  }

  async function searchPostByNumber(postNumber) {
    const query = `
      query {
        posts(where: { postNumber: ${postNumber} }) {
          id
          title
          content {
            html
          }
          imageLink
          postNumber
          trending
          category
          actors
          network
          likes
          views
        }
      }
    `;
    try {
      const response = await fetch(HYGRAPH_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      return data.data.posts;
    } catch (error) {
      console.error("Error searching post:", error);
      return [];
    }
  }

  searchBox.addEventListener("input", async (event) => {
    const query = event.target.value;
    if (query) {
      const searchResults = await searchPostByNumber(query);

      searchResultsContainer.innerHTML = ""; // Clear previous search results

      if (searchResults.length > 0) {
        // Display search results if posts are found
        searchResults.forEach((post) => {
          const postElement = createPostElement(post);
          searchResultsContainer.appendChild(postElement);
        });
      } else {
        // Display "Post Not Found" message if no posts are found
        const notFoundMessage = document.createElement("div");
        notFoundMessage.textContent = "Post Not Found";
        searchResultsContainer.appendChild(notFoundMessage);
      }
    } else {
      searchResultsContainer.innerHTML = ""; // Clear search results when input is empty
    }
  });

  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      loadPosts(); // Load more posts when scrolled to the bottom
    }
  });

  loadPosts(); // Initial load of posts
});
