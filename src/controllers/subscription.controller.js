import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subcriptions.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // get the channel id and access the subscriber id(the user)
  // checking for the existing subscriber
  // if subscriber exists,delete it
  // if no subscriber , create new one and save it
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid ChannelID");
  }
  try {
    const existingsubscriber = await Subscription.findOne({
      channel: channelId,
      subscriber: req.user?._id,
    });
    if (existingsubscriber) {
      await Subscription.findByIdAndDelete(existingsubscriber._id);
      res
        .status(200)
        .json(new ApiResponse(200, {}, "channel unsubscribed succesfully"));
    } else {
      const subscriber = new Subscription({
        subscriber: req.user?._id,

        channel: channelId,
      });
      const subscribed = await subscriber.save({ validateBeforeSave: false });
      res
        .status(200)
        .json(
          new ApiResponse(200, subscribed, "channel subscribed succesfully")
        );
    }
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "unable to toggle the subscription");
  }
});
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  //Extracts channelId from request parameters
  //uses $match to filter the subscription for the specified channel
  //uses $lookup to join the user collection and retrieve the subscriber details
  //$count to count the total subscribers
  //return the list of subscribedChannels
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channel Id");
  }
  try {
    const subscriber = await Subscription.aggregate([
      { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscribedChannels",
        },
      },
      //   { $unwind: "$subscribedChannels" },
      //   {
      //     $project: {
      //       _id: 1,
      //       subscriber: {
      //         _id: "$subscribedChannels._id",
      //         username: "$subscribedChannels.username",
      //         fullname: "$subscribedChannels.fullname",
      //         avatar: "$subscribedChannels.avatar",
      //       },
      //     },
      //   },
      {
        $count: "totalSubscribers",
      },
    ]);

    if (subscriber.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, subscriber, "No subscriber yet"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, subscriber, "Subscribers fetched successfully")
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "something wrong while getting subscriber!");
  }
});
// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  // check all the channel subscribed for the rea.user

  try {
    const subscribedChannels = await Subscription.aggregate([
      { $match: { subscriber: new mongoose.Types.ObjectId(req.user?._id) } },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "subscribedChannels",
        },
      },
      { $unwind: "$subscribedChannels" },
      {
        $project: {
          _id: 1,
          channel: {
            _id: "$subscribedChannels._id",
            // username: "$subscribedChannels.username",
            fullname: "$subscribedChannels.fullname",
            // avatar: "$subscribedChannels.avatar",
          },
        },
      },
    ]);
    if (subscribedChannels.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "no channel subscribed yet"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribedChannels,
          "fetched all subcribed channel"
        )
      );
  } catch (error) {
    throw new ApiError(
      400,
      "something went wrong in getting all subscribed channels"
    );
  }
});
export { toggleSubscription, getSubscribedChannels, getUserChannelSubscribers };
