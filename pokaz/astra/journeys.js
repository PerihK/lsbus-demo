const reel = $('.route-reel');
const stories = directions.map(direction => {
  const link = document.createElement('a');
  link.className = 'route-pane';
  link.href = 'trip-' + direction.id + '.html';
  const image = document.createElement('img');
  image.src = direction.picture; image.alt = direction.alt; image.loading = 'lazy';
  const caption = document.createElement('div');
  caption.className = 'pane-caption';
  const heading = document.createElement('h3'), route = document.createElement('span');
  heading.textContent = direction.name;
  route.textContent = direction.route.join('  ·  ');
  caption.append(heading, route); link.append(image, caption);
  return link;
});
reel.append(...stories);
function featureStory(active) {
  stories.forEach(story => story.classList.toggle('featured', story === active));
}
for (const story of stories) {
  story.onpointerenter = event => {if (event.pointerType === 'mouse') featureStory(story);};
  story.onfocus = () => featureStory(story);
}
featureStory(stories[0]);
