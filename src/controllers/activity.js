const { soapRequest, wsdl } = require("../lib/soap");

const dataMockup = {
  trainers: [
    { name: "Matej Lošický", id: 10 },
    { name: "Roman Marek", id: 11 },
    { name: "Ivana Lumanová", id: 1 },
  ],
  rooms: [
    { name: "Miestnosť S1", id: 1 },
    { name: "Miestnosť M1", id: 2 },
    { name: "Miestnosť M2", id: 3 },
    { name: "Miestnosť L1", id: 4 },
    { name: "Miestnosť L2", id: 5 },
  ],
  branches: [
    { name: "Bratislava I", id: 1 },
    { name: "Bratislava II", id: 2 },
    { name: "Košice", id: 3 },
  ],
};

/**
 * Attach hasReservation to activity object in activities
 * hasReservation is determined by user_id
 * @param {*} activities
 * @param {*} reservation
 */
const attachHasReservation = (activities, reservation) =>
  activities.map((a) => ({
    ...a,
    hasReservation: reservation.some(({ activity_id }) => activity_id === a.id),
  }));

const showCreateActivity = async (req, res) => {
  if (req.user.role !== 'TRAINER') {
    return res.redirect('/')
  }

  try {
    const { activity_types } = await soapRequest(
      wsdl.activity_type,
      "getAll",
      {}
    );
    console.log(activity_types);
    res.render("pages/activity/create", {
      activity_types: activity_types.activity_type,
      ...dataMockup,
      user: req.user
    });
  } catch (error) {
    console.log(error);
  }
};

const showAllActivities = async (req, res) => {
  try {
    const {
      activitys: { activity = [] },
    } = await soapRequest(wsdl.activity, "getAll", {});

    const { reservations } = await soapRequest(
      wsdl.reservation,
      "getByAttributeValue",
      {
        attribute_name: "user_id",
        attribute_value: req.user.id,
        ids: [0],
      }
    );
    const {reservation = []} = reservations || {}

    console.log(attachHasReservation(activity, reservation));
    res.render("pages/activity/show_all", {
      activities: attachHasReservation(activity, reservation),
    });
  } catch (error) {
    console.error(error);
    res.render("error");
  }
};

const handleCreateActivity = async (req, res) => {
  try {
    await soapRequest(wsdl.activity, "insert", {
      activity: {
        name: req.body.name,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        activity_type_id: req.body.activity_type_id,
        trainer_id: req.body.trainer_id,
        room_id: req.body.room_id,
        branch_id: req.body.branch_id,
        confirmed: req.body.confirmed,
      },
    });
    res.redirect("/activity");
  } catch (error) {
    console.log(err);
    res.json({ status: "FAIL!" });
  }
};

module.exports = {
  showCreateActivity,
  showAllActivities,
  handleCreateActivity,
};
