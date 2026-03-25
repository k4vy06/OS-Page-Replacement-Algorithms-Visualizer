/**
 * Page Replacement Algorithms implementation
 */

export const fifo = (referenceString, frameCount) => {
  let frames = new Array(frameCount).fill(null);
  let steps = [];
  let faultsCount = 0;
  let hitsCount = 0;
  let nextReplaceIndex = 0;

  referenceString.forEach((request, index) => {
    let isFault = false;
    let replacedIndex = null;

    if (!frames.includes(request)) {
      isFault = true;
      faultsCount++;
      replacedIndex = nextReplaceIndex;
      frames[nextReplaceIndex] = request;
      nextReplaceIndex = (nextReplaceIndex + 1) % frameCount;
    } else {
      hitsCount++;
    }

    steps.push({
      stepIndex: index,
      request,
      frames: [...frames],
      isFault,
      replacedIndex,
      faultsCount,
      hitsCount
    });
  });

  return { steps, totalFaults: faultsCount, totalHits: hitsCount };
};

export const lru = (referenceString, frameCount) => {
  let frames = new Array(frameCount).fill(null);
  let lastUsed = new Array(frameCount).fill(-1);
  let steps = [];
  let faultsCount = 0;
  let hitsCount = 0;

  referenceString.forEach((request, index) => {
    let isFault = false;
    let replacedIndex = null;

    const frameIndex = frames.indexOf(request);
    if (frameIndex === -1) {
      isFault = true;
      faultsCount++;
      
      // Find empty slot or least recently used
      const emptySlot = frames.indexOf(null);
      if (emptySlot !== -1) {
        replacedIndex = emptySlot;
      } else {
        let lruIndex = 0;
        let minLastUsed = lastUsed[0];
        for (let i = 1; i < frameCount; i++) {
          if (lastUsed[i] < minLastUsed) {
            minLastUsed = lastUsed[i];
            lruIndex = i;
          }
        }
        replacedIndex = lruIndex;
      }
      frames[replacedIndex] = request;
      lastUsed[replacedIndex] = index;
    } else {
      hitsCount++;
      lastUsed[frameIndex] = index;
    }

    steps.push({
      stepIndex: index,
      request,
      frames: [...frames],
      isFault,
      replacedIndex,
      faultsCount,
      hitsCount
    });
  });

  return { steps, totalFaults: faultsCount, totalHits: hitsCount };
};

export const optimal = (referenceString, frameCount) => {
  let frames = new Array(frameCount).fill(null);
  let steps = [];
  let faultsCount = 0;
  let hitsCount = 0;

  referenceString.forEach((request, index) => {
    let isFault = false;
    let replacedIndex = null;

    const frameIndex = frames.indexOf(request);
    if (frameIndex === -1) {
      isFault = true;
      faultsCount++;

      const emptySlot = frames.indexOf(null);
      if (emptySlot !== -1) {
        replacedIndex = emptySlot;
      } else {
        // Optimal replacement: find frame that will not be used for longest period of time
        let farthestIndex = -1;
        let replaceTarget = 0;

        for (let i = 0; i < frameCount; i++) {
          const nextUse = referenceString.slice(index + 1).indexOf(frames[i]);
          if (nextUse === -1) {
            replaceTarget = i;
            break;
          }
          if (nextUse > farthestIndex) {
            farthestIndex = nextUse;
            replaceTarget = i;
          }
        }
        replacedIndex = replaceTarget;
      }
      frames[replacedIndex] = request;
    } else {
      hitsCount++;
    }

    steps.push({
      stepIndex: index,
      request,
      frames: [...frames],
      isFault,
      replacedIndex,
      faultsCount,
      hitsCount
    });
  });

  return { steps, totalFaults: faultsCount, totalHits: hitsCount };
};
