export const addRecordTracking = (originalData, newData, user, module, method) => {
  const changedFields = {};
  
  // Compare fields to find changes
  if (method === 'update' && originalData) {
    Object.keys(newData).forEach(key => {
      if (key !== 'recordTracking' && key !== 'updatedAt' && key !== 'createdAt') {
        if (JSON.stringify(originalData[key]) !== JSON.stringify(newData[key])) {
          changedFields[key] = {
            from: originalData[key],
            to: newData[key]
          };
        }
      }
    });
  } else if (method === 'create') {
    // For create, log all provided fields
    Object.keys(newData).forEach(key => {
      if (key !== 'recordTracking' && key !== 'updatedAt' && key !== 'createdAt') {
        changedFields[key] = {
          from: null,
          to: newData[key]
        };
      }
    });
  }

  return {
    id: Date.now(),
    module,
    method,
    userId: user._id,
    userName: user.userName,
    modifiedAt: new Date(),
    changedFields
  };
};

export const trackRecord = async (Model, documentId, originalData, newData, user, module, method) => {
  const trackingEntry = addRecordTracking(originalData, newData, user, module, method);
  
  await Model.findByIdAndUpdate(
    documentId,
    { $push: { recordTracking: trackingEntry } },
    { new: true }
  );
};