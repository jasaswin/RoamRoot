const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const generateBookingReference = require("../utils/generateBookingReference");
const { sendSuccess } = require("../utils/apiResponse");

const DAY = 24 * 60 * 60 * 1000;

// Dates are stored at midnight UTC so "same day" checks are easy
function toDay(value) {
  const d = new Date(value);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

exports.createBooking = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.body.listing);
  if (!listing) throw new ApiError(404, "Listing not found");
  if (listing.availability.isAvailable === false) throw new ApiError(400, "This listing is not available right now");
  if (listing.creator.equals(req.user._id)) throw new ApiError(400, "You cannot book your own listing");

  const isStay = listing.type === "STAY";
  const checkIn = toDay(req.body.checkIn);
  // experiences happen on one day, so check-out is the same as check-in
  const checkOut = isStay ? toDay(req.body.checkOut) : checkIn;
  const guests = req.body.guests;

  if (checkIn < toDay(new Date())) throw new ApiError(400, "Check-in date cannot be in the past");
  if (isStay && !(checkOut > checkIn)) throw new ApiError(400, "Check-out must be after check-in");
  if (guests > listing.capacity) throw new ApiError(400, `This listing allows up to ${listing.capacity} guests`);

  const { availableFrom, availableTo } = listing.availability;
  if ((availableFrom && checkIn < availableFrom) || (availableTo && checkOut > availableTo)) {
    throw new ApiError(400, "Those dates are outside the availability window");
  }

  // Is there room? Stays are one unit; experiences share the capacity for the day.
  const active = { status: { $in: ["PENDING", "CONFIRMED"] } };
  if (isStay) {
    const clash = await Booking.findOne({
      listing: listing._id,
      ...active,
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    });
    if (clash) throw new ApiError(409, "Those dates are already booked");
  } else {
    const sameDay = await Booking.find({ listing: listing._id, ...active, checkIn });
    const taken = sameDay.reduce((sum, b) => sum + b.guests, 0);
    if (taken + guests > listing.capacity) {
      throw new ApiError(409, `Only ${listing.capacity - taken} spots left on that day`);
    }
  }

  // The price is always calculated on the server
  const nights = Math.round((checkOut - checkIn) / DAY);
  const totalPrice = isStay ? nights * listing.price : guests * listing.price;

  const booking = await Booking.create({
    user: req.user._id,
    listing: listing._id,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    bookingReference: generateBookingReference(),
  });
  sendSuccess(res, { booking }, 201);
});

exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("listing", "title images location type price destination");
  sendSuccess(res, { bookings });
});

// Booking guest, the listing creator, or an admin can view a booking
async function findBookingWithAccess(req) {
  const booking = await Booking.findById(req.params.id).populate("listing");
  if (!booking) throw new ApiError(404, "Booking not found");
  const isGuest = booking.user.equals(req.user._id);
  const isHost = booking.listing && booking.listing.creator.equals(req.user._id);
  if (!isGuest && !isHost && req.user.role !== "ADMIN") {
    throw new ApiError(403, "You cannot access this booking");
  }
  return { booking, isGuest, isHost };
}

exports.getBooking = asyncHandler(async (req, res) => {
  const { booking } = await findBookingWithAccess(req);
  sendSuccess(res, { booking });
});

// Guests can cancel. Creators can confirm, cancel or complete bookings of their listings.
exports.updateBooking = asyncHandler(async (req, res) => {
  const { booking, isGuest, isHost } = await findBookingWithAccess(req);
  const newStatus = req.body.status;
  const isAdmin = req.user.role === "ADMIN";

  if (isGuest && !isHost && !isAdmin && newStatus !== "CANCELLED") {
    throw new ApiError(403, "You can only cancel your own booking");
  }
  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    throw new ApiError(400, `This booking is already ${booking.status.toLowerCase()}`);
  }
  booking.status = newStatus;
  await booking.save();
  sendSuccess(res, { booking });
});

exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");
  if (!booking.user.equals(req.user._id) && req.user.role !== "ADMIN") {
    throw new ApiError(403, "You cannot delete this booking");
  }
  if (booking.status !== "CANCELLED") throw new ApiError(400, "Cancel the booking before deleting it");
  await booking.deleteOne();
  sendSuccess(res, { message: "Booking removed" });
});
