+++
title = "Dual-LiDAR MAV tracking: from one blind sensor to two that cover for each other"
date = 2026-07-20T01:00:00+06:00
draft = false
summary = "A single Livox Mid-360 lost the drone past 3m and jittered at range. Adding a second sensor fixed coverage but broke tracking in the overlap zone — this is how that got fixed."
tags = ["ros2", "lidar", "kalman-filter", "robotics", "sensor-fusion"]
video = ""   # paste your YouTube ID here, e.g. "dQw4w9WgXcQ"
toc = true
+++

<!-- Optional: swap this for {{< yt id="YOUR_ID" >}} if you'd rather embed
     mid-post instead of at the top via front matter -->

## The problem

Single Livox Mid-360, mounted indoors, tracking a small MAV via background-
subtraction clustering. Worked, but:

- **Range capped at ~3m.** Past that the drone's small cross-section didn't
  return enough LiDAR points per scan to cluster reliably — track loss.
- **The test pit is only a few metres across**, so that range limit ate most
  of the usable flight volume.
- **Jitter got worse with distance** as point density on the target dropped.

## Going dual-sensor

Added a second Mid-360, mounted in the opposite corner. Every point in the
flight volume now falls in range of at least one sensor. Each sensor also has
a blind cone directly overhead — with two units in opposite corners, each
one's blind spot sits inside the other's field of view.

{{< gallery >}}
<!-- drop images in this post folder named gallery-01.jpg, gallery-02.jpg, etc -->

That fix introduced the real problem: making both sensors agree on where
things are in space.

## Cutting FAST-LIO2

The single-sensor stack used FAST-LIO2 for motion undistortion and world-frame
registration. Both Mid-360 units here are rigidly mounted and static, so
there's no motion to undistort. Running two FAST-LIO2 instances was
considered and dropped — it would've produced two independently drifting
odometry frames needing constant re-alignment, which defeats the point.

Removed it entirely. Each sensor's raw cloud now gets a fixed, manually
calibrated extrinsic transform straight into a shared **pit frame**.

## Package: `dual_lidar_tracker`

- `livox_ros_driver2` natively serves both units from one driver instance
  (`multi_topic` launch option) — one PointCloud2 topic per sensor IP, no
  custom message splitting needed.
- Each sensor's cloud is transformed into the pit frame via yaw rotation +
  translation, then independently cropped, background-subtracted, and
  clustered — yielding one centroid candidate per sensor per frame.
- A **cloud fuser** node republishes both sensors' clouds merged and
  colour-coded (green / orange) for live calibration sanity-checks: a shared
  wall or floor should appear as one surface, not two offset sheets.

{{< img src="fused-view.png" alt="Fused dual-LiDAR point cloud in RViz2" caption="Green and orange point clouds from each sensor, colour-coded in the shared pit frame." >}}

Extrinsics were calibrated per-sensor against manually measured pit geometry
(wall/floor/corner clicks in RViz2), not sensor-to-sensor — two sensors can
agree with each other while both being wrong relative to the real room.

## The actual bug: phasing in the overlap zone

Tracking was solid near either sensor alone. In the middle, where both
sensors saw the drone, position estimates jumped between two apparent
locations instead of moving smoothly. Three causes:

1. **Point-count-weighted centroid bias** — merging both clouds before
   computing one centroid meant whichever sensor happened to return more
   points that frame silently dominated the estimate.
2. **Residual extrinsic error** — small calibration offsets between sensors,
   invisible near either one alone, became the dominant error exactly where
   both views overlapped.
3. **Temporal misalignment** — clouds merged inside a fixed time window let
   stale data from one sensor mix with fresh data from the other.

## Fix: per-sensor Kalman fusion instead of cloud merging

Stopped merging raw clouds. Each sensor now produces its own independently
timestamped centroid, and both feed the tracking Kalman filter as **separate**
measurements rather than one combined observation. That alone kills the
temporal-misalignment issue.

For the point-count bias, each measurement gets noise inversely scaled to its
supporting point count, so weak detections get automatically down-weighted by
the filter instead of contributing equally regardless of confidence:
r_i = r0 · sqrt( min(16, max(1, n_ref / n_i)) )

For residual extrinsic disagreement: an online bias monitor tracks a running
average of the vector difference between the two sensors' centroids whenever
both see the drone in the same window, converged over a static test at the
overlap centre, then subtracted directly from the second sensor's calibrated
pose. Brought inter-sensor disagreement down from several cm to close to the
sensors' own baseline noise — what's left is mostly just the drone's physical
depth, since each sensor sees a different face of it.

{{< img src="trajectory.png" alt="Tracked drone flight trajectory" caption="Linear-drive trajectory tracked across both sensors' domains." >}}

## Where it stands

Runs at native 10Hz per sensor, up to 20Hz combined in the overlap region,
centimetre-level inter-sensor agreement — good enough for stable position and
velocity tracking, not yet archival-grade.

**Not done yet:**
- Roll/pitch assumed zero (only yaw + translation modeled) — a real tilt
  shows up as a sloped floor in the fused view
- Some residual jitter right at the overlap boundary, where the sensor count
  flips from one to two
- Accuracy only validated near pit centre, not the corners/edges
- 10Hz is a hardware ceiling per sensor; could still cut latency via smaller
  frame-accumulation windows or async per-sensor Kalman prediction between
  measurements

No ground truth on the collected trajectories yet — validated visually for
coherence, not against a reference. That's the next pass.