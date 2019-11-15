<script>
  let data = [];
  let term = "";

  function embed(node, tweet) {
    twttr.widgets.createTweet(tweet.id_str, node, { align: "center" });
    return {
      update(newTweet) {
        node.innerHTML = "";
        twttr.widgets.createTweet(newTweet.id_str, node, { align: "center" });
      }
    };
  }

  function getTweets() {
    Promise.all([
      fetch("/api/statuses/user_timeline.json?count=200&trim_user=1&include_rts=1")
      .then(response => response.json()),

      fetch("/api/favorites/list.json?count=200&include_entities=false")
      .then(response => response.json()),

      fetch("/api/direct_messages/events/list.json?count=50")
      .then(response => response.json())
      .then(json => json.events.map(event => event.message_create.message_data)),

    ]).then(json => {
      data = json.flat().filter(tweet => tweet.text.match(new RegExp(term, "i")));
    });
  }
</script>

<svelte:head>
	<title>Find Tweets</title>
</svelte:head>

<ol>
  <li><a href="/login">Login</a></li>
  <li>
    <form on:submit|preventDefault={getTweets}>
      <input bind:value={term}/>
      <button type="submit">Find Tweets</button>
      <span>— {data.length} found</span>
    </form>
  </li>
</ol>

{#each data as tweet }<div use:embed={tweet}></div>{/each}
