const {test} = require('tap');

const {createCluster} = require('./../macros');
const {delay} = require('./../macros');
const getChannels = require('./../../getChannels');
const getPendingChannels = require('./../../getPendingChannels');
const openChannel = require('./../../openChannel');

const confirmationCount = 20;
const maxChannelCapacity = 16776216;

// Getting channels should return the list of channels
test(`Get channels`, async ({end, equal}) => {
  const cluster = await createCluster({});

  const {lnd} = cluster.control;

  const chanOpen = await openChannel({
    lnd,
    partner_public_key: cluster.target_node_public_key,
    socket: `${cluster.target.listen_ip}:${cluster.target.listen_port}`,
  });

  await cluster.generate({count: confirmationCount});

  const pending = await getPendingChannels({lnd});

  const {channels} = await getChannels({lnd});

  const [channel] = channels;

  equal(channel.capacity, maxChannelCapacity, 'Channel capacity');
  equal(channel.is_active, true, 'Channel active');
  equal(channel.is_closing, false, 'Channel not closing');
  equal(channel.is_opening, false, 'Channel not opening');
  equal(channel.is_private, false, 'Channel not private');
  equal(channel.partner_public_key, cluster.target_node_public_key, 'Pubkey');
  equal(channel.received, 0, 'Channel received');
  equal(channel.remote_balance, 0, 'Channel remote balance');
  equal(channel.sent, 0, 'Channel sent');
  equal(channel.transaction_vout, 0, 'Channel transactin vout');
  equal(channel.unsettled_balance, 0, 'Channel unsettled balance');

  await cluster.kill({});

  return end();
});

