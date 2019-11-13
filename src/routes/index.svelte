<script>
  let data = {};
  let term = "";

  function withStatusUrls(tweets) {
    return tweets.map(x => ({ ...x, url: "https://twitter.com/i/web/status/" + x.id_str }));
  }

  function getTweets() {
    Promise.all([
      fetch("/api/statuses/user_timeline.json")
      .then(response => response.json())
      .then(withStatusUrls),

      fetch("/api/favorites/list.json")
      .then(response => response.json())
      .then(withStatusUrls),

      fetch("/api/direct_messages/events/list.json")
      .then(response => response.json())
      .then(json => json.events.map(event => event.message_create.message_data)),

    ]).then(json => json.flat())
      .then(json => json.filter(tweet => tweet.text.includes(term)))
      .then(json => json.map(tweet => ({ text: tweet.text, url: tweet.url })))
      .then(allTheTweets => data = allTheTweets);
  }
</script>

<svelte:head>
	<title>Find Tweets</title>
</svelte:head>

<a href="/login">Login</a>
<br>
<input bind:value={term}/>
<button on:click={getTweets}>Get Tweets</button>
<pre><code>{JSON.stringify(data, null, 4)}</code></pre>
