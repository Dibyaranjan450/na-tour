const stripe = Stripe(
  'pk_test_51QNTgwRpzwm3GPhS3OHD9uzXHCV4ZmEHxHoWniHyLXhY8prtbP26GSXtKX3DEjHitmzHV1ud9wqxAkBsVSaljwLJ00A4rkRNnW'
);

const bookBtn = document.getElementById('book-tour');

const bookTour = async (tourId) => {
  try {
    // Get checkout session from API
    const session = await axios(
      `http://localhost:4000/api/v1/bookings/checkout-session/${tourId}`
    );
    // console.log(session);

    //Craete checkout form & charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

if (bookBtn) {
  bookBtn.addEventListener('click', async (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    await bookTour(tourId);
    e.target.textContent = 'Book tour now!';
  });
}
