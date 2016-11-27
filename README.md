# Boogie
Control Spotify by dancing, check it out here: [Boogie online](https://ncuotto.github.io/boogie/)

*Note:* right now Boogie only supports horizontal movement tracking, so make sure to find compatible dancemoves ;)

By the Boogie team:

- Nadia Cuotto
- Alejandro Vera De Juan
- Bart Olsthoorn

Built at [#STC2016](https://www.instagram.com/explore/tags/stc2016/) @ Spotify HQ in Stockholm

## How it works
1. Click anywhere and move away from the camera view for a second or two. A snapshot of the background will be taken to subtract that from every frame.
2. The app tells you to come back and start dancing.
3. The pixels that are different from the background snapshot are counted along the x-axis. This histogram is plotted in the mini-view (top-right of the window). The maximum of this histogram is tracked over time, and using some number crunching we arrive at a BPM.
4. The BPM is used to query the Spotify web API for a song with the same BPM and maximum danceability ✨!
5. If you stop dancing, the music will stop and you can start dancing again for a new matching song.
5. Click anywhere or on the Boogie logo to reset.

