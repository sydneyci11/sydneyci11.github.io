const interestPhotos = {
  photography: [
    { src: "images/profile/interests/sunlit-building-facade.jpeg", alt: "A sunlit stone building beneath a clear blue sky." },
    { src: "images/profile/interests/london-westminster-street.jpeg", alt: "A central London street scene with the Elizabeth Tower in the distance." },
    { src: "images/profile/interests/sunset-gathering.jpeg", alt: "A hillside gathering photographed at sunset." }
  ],
  music: [
    { src: "images/profile/interests/live-music-lightstick.jpeg", alt: "A glowing concert lightstick against a night crowd." },
    { src: "images/profile/interests/live-music-concert-stage.jpeg", alt: "Musicians performing on a stage lit with blue visuals." }
  ]
};

const lastInterestPhoto = {};

function revealInterestPhoto(card) {
  const image = card.querySelector(".interest-card__photo");
  const placeholder = card.querySelector(".interest-card__visual");
  if (!image || !placeholder) return;

  const category = card.classList.contains("interest-card--photography")
    ? "photography"
    : card.classList.contains("interest-card--music") ? "music" : null;
  if (!category) return;
  const photos = interestPhotos[category];
  if (!photos?.length) return;

  let nextIndex = Math.floor(Math.random() * photos.length);
  if (photos.length > 1 && nextIndex === lastInterestPhoto[category]) {
    nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (photos.length - 1))) % photos.length;
  }
  lastInterestPhoto[category] = nextIndex;

  const photo = photos[nextIndex];
  image.hidden = false;
  placeholder.hidden = true;
  image.alt = photo.alt;
  image.src = photo.src;
}

document.querySelectorAll(".interest-card").forEach((card) => {
  const front = card.querySelector(".interest-card__front");
  const back = card.querySelector(".interest-card__back");
  const image = card.querySelector(".interest-card__photo");
  const placeholder = card.querySelector(".interest-card__visual");
  if (!front || !back || !image || !placeholder) return;

  const category = card.classList.contains("interest-card--photography")
    ? "photography"
    : card.classList.contains("interest-card--music") ? "music" : null;
  if (category) {
    image.addEventListener("error", () => {
      image.hidden = true;
      placeholder.hidden = false;
    });
    image.addEventListener("load", () => {
      image.hidden = false;
      placeholder.hidden = true;
    });
  }

  front.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") revealInterestPhoto(card);
  });

  front.addEventListener("click", () => {
    revealInterestPhoto(card);
    card.classList.add("is-open");
    front.setAttribute("aria-expanded", "true");
    back.focus({ preventScroll: true });
  });

  back.addEventListener("click", () => {
    card.classList.remove("is-open");
    front.setAttribute("aria-expanded", "false");
    front.focus({ preventScroll: true });
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !card.classList.contains("is-open")) return;
    card.classList.remove("is-open");
    front.setAttribute("aria-expanded", "false");
    front.focus({ preventScroll: true });
  });
});
