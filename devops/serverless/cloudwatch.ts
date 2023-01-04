export const CloudwatchPolicies = [
  {
    Effect: "Allow",
    Action: [
      "logs:CreateLogStream",
      "logs:CreateLogGroup",
      "logs:PutLogEvents",
    ],
    Resource: "arn:aws:logs:*:*:*",
  },
];
