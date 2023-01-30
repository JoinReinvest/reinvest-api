export const SMSPolicy = {
    Effect: "Allow",
    Action: [
        "sns:Publish",
    ],
    NotResource: "arn:aws:sns:*:*:*"
}