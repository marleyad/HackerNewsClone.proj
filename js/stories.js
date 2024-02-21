"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showFavStar = Boolean(currentUser)

  return $(`
      <li id="${story.storyId}">
        ${showFavStar ? makeStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// Creating an icon for favorite stories

function makeStarHTML(story, user) {
  const isitFavorite = user.isFavorite(story)
  const starType = isitFavorite ? "fas" : "far"
  return`
    <span class="star">
      <i class="${starType} fa-star"></i>
    </span>`
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// Delete story:

async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  await putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);







// Submit a new story
async function submitNewStory(e) {
  console.debug("submitNewStory debug here")
  e.preventDefault()

  // Collect information from form:
  const title = $('#created-title').val()
  const url = $('#created-url').val()
  const author = $('#created-author').val()
  const username = currentUser.username

  // Put everything into 1 Variable
  const storyData = { title, url, author, username}

  const story = await storyList.addStory(currentUser, storyData)

  const $story = generateStoryMarkup(story)
  $allStoriesList.prepend($story)

  // Form - Hid then reset it
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitNewStory);

// ****************************************************


function postStoriesonPage() {
  $ownStories.empty()

  if(currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>There haven't been any user stories added</h5>")
  } else {
    for (let post of currentUser.ownStories) {
      let $post = generateStoryMarkup(post, true)
      $ownStories.append($post)
    }
  }
  $ownStories.show()
}

// for Favorites - Display list on page
function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites yet!</h5>");
  } else {
    // Go through the favorites and generate HTML
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }
  $favoritedStories.show();
}

// toggles between favorite and unfavorite
async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($tgt.hasClass("fas")) {
    // currently a favorite: remove from user's fav list and change star
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    // currently not a favorite: do the opposite
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}