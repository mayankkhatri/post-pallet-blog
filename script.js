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
          imageLink
          postNumber
          trending
          imageLink
          category
          actors
          network
          likes
          views
          token
       
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
    const postElement = document.createElement("a");
    postElement.className = "post";
    postElement.href = `${post.token}`;
    postElement.innerHTML = `
      <div class="image-container"><img src="${post.imageLink}" alt="${post.title}" /></div>
  <div class="post-details">
    <div class="post-meta">
    <p class="post-number"><strong>Post No:</strong> <span class="red">${post.postNumber}</span></p>
      <p class="likes"><strong>Likes:</strong> ${post.likes}</p>
      <p class="views"><strong>Views:</strong> ${post.views}</p>
    </div>
    <h3 class="title">${post.title}</h3>
    <div class="video-meta">
      <p class="actors"><strong>Actors:</strong> ${post.actors}</p>
      <p class="network"><strong>Network:</strong> ${post.network}</p>
      <p class="category"><strong>Category:</strong> ${post.category}</p>
    </div>
  </div>
    `;
    return postElement;
  }

  async function searchPostByNumber(postNumber) {
    const query = `
      query {
        posts(where: { postNumber: ${postNumber} }) {
          id
          title
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
          const searchHeding = document.createElement("h2");
          searchHeding.innerText = "Search Results";
          searchResultsContainer.appendChild(searchHeding);
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
