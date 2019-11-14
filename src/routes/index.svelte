<style>
  :global(twitter-widget) {
    margin: 0 auto;
  }
</style>
<script>
  // TODO
  //  1. Make Twitter do the hard work for user_timeline search
  //  2. How to show DMs?

  let data = [];
  let term = "";

  $: console.log(data);

  function embed(node, tweet) {
    twttr.widgets.createTweet(tweet.id_str, node);
    return {
      update(newTweet) {
        node.innerHTML = "";
        twttr.widgets.createTweet(newTweet.id_str, node);
      }
    };
  }

  function getTweets() {
    Promise.all([
      fetch("/api/statuses/user_timeline.json?count=200")
      .then(response => response.json()),

      fetch("/api/favorites/list.json?count=200")
      .then(response => response.json()),

      // fetch("/api/direct_messages/events/list.json?count=50")
      // .then(response => response.json())
      // .then(json => json.events.map(event => event.message_create.message_data)),

    ]).then(json => {
      data = json.flat().filter(tweet => tweet.text.match(new RegExp(term, "i")));
    });
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
{#each data as tweet }<div use:embed={tweet}></div>{/each}
