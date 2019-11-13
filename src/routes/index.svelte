<script>
  // TODO
  //  1. Click through (using Twitter embed)
  //  2. Make Twitter do the hard work for user_timeline search
  //  3. How to show DMs?

  let data = [];
  let term = "";

  function withStatusUrls(tweets) {
    return tweets.map(x => ({ ...x, url: "https://twitter.com/i/web/status/" + x.id_str }));
  }

  function getTweets() {
    Promise.all([
      fetch("/api/statuses/user_timeline.json?count=200")
      .then(response => response.json())
      .then(withStatusUrls),

      fetch("/api/favorites/list.json?count=200")
      .then(response => response.json())
      .then(withStatusUrls),

      fetch("/api/direct_messages/events/list.json?count=200")
      .then(response => response.json())
      .then(json => json.events.map(event => event.message_create.message_data)),

    ]).then(json => json.flat())
      .then(json => json.filter(tweet => tweet.text.match(new RegExp(term, "i"))))
      .then(json => data = json.map(tweet => ({ text: tweet.text, url: tweet.url })));
  }
</script>

<svelte:head>
	<title>Find Tweets</title>
</svelte:head>

<a href="/login">Login</a>
<br>
<form on:submit|preventDefault={getTweets}>
  <input bind:value={term}/>
  <button type="submit">Get Tweets</button>
</form>
{#each data as { text, url }}<p><a href="{url}" target="_blank">{text}</a></p>{/each}
