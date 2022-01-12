<script>
  /**
    Generates HTML text labels for a nested data structure. It places the label near the y-value of the highest x-valued data point. This is useful for labeling the final point in a multi-series line chart, for example. It expects your data to be an array of objects where each has `values` field that is an array of data objects. It uses the `z` field accessor to pull the text label.
  */
  import { getContext } from 'svelte';
  import { max } from 'd3-array';

  const { data, x, y, xScale, yScale, xRange, yRange, z } = getContext('LayerCake');

  /* --------------------------------------------
   * Title case the first letter
   */
  const cap = val => val.replace(/^\w/, d => d.toUpperCase());

  /* --------------------------------------------
   * Put the label on the highest value
   */
  $: left = values => $xScale(max(values, $x)) /  Math.max(...$xRange) * 0.98;
  $: top = values => $yScale(max(values, $y)) / Math.max(...$yRange)*6;
</script>

{#each $data as group}
  <div
    class="label  label-{group['name'].substring(0,5)}"
    style="
      top:{top(group.values) * 100}%;
      left:{left(group.values) * 100}%;
      width: 25%;
    "
  >{cap($z(group))}</div>
{/each}

<style>
  .label {
    position: absolute;
    transform: translate(-100%, -100%)translateY(1px);
    font-size: 13px;
  }

  .label-Offic{
    color: #beaf90;
  }

  .label-Caixi {
    color: #30bce0;
  }
</style>