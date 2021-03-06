const {test} = require('tap');

const {createCluster} = require('./../macros');
const {delay} = require('./../macros');
const getChannel = require('./../../getChannel');
const getChannels = require('./../../getChannels');
const openChannel = require('./../../openChannel');

const confirmationCount = 20;

// Getting a channel should return channel details from the channel graph
test(`Get channel`, async ({end, equal}) => {
  const cluster = await createCluster({});

  const {lnd} = cluster.control;

  await delay(3000);

  await openChannel({
    lnd,
    partner_public_key: cluster.target_node_public_key,
    socket: `${cluster.target.listen_ip}:${cluster.target.listen_port}`,
  });

  await delay(3000);

  await cluster.generate({count: confirmationCount});

  await delay(2000);

  const {channels} = await getChannels({lnd});

  const [channel] = channels;

  const {id} = channel;

  const details = await getChannel({id, lnd});

  equal(details.capacity, channel.capacity, 'Capacity');
  equal(details.policies.length, [cluster.control, cluster.target].length);

  details.policies.forEach(policy => {
    equal(policy.base_fee_mtokens, '1000', 'Base fee mtokens');
    equal(policy.cltv_delta, 144, 'CLTV policy');
    equal(policy.fee_rate, 1, 'Fee rate');
    equal(policy.is_disabled, false, 'Disabled flag');
    equal(policy.min_htlc_mtokens, 1000, 'Min HTLC value');
    equal(policy.public_key.length, 66, 'Policy public key');

    return;
  });

  equal(details.transaction_id, channel.transaction_id, 'Funding tx id');
  equal(details.transaction_vout, channel.transaction_vout, 'Funding tx vout');
  equal(Date.now() - new Date(details.updated_at) < 1e5, true, 'Updated at');

  await cluster.kill({});

  return end();
});

