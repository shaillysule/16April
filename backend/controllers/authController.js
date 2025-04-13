res.status(200).json({
    token,
    role: user.role,
    name: user.name,
    email: user.email,
    isSubscribed: user.subscriptionActive,
    freeAITrials: user.freeAITrials,
  });
  