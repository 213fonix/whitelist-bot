const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

// إعدادات
const TOKEN = '';  
const ROLE1_ID = '';
const ROLE2_ID = '';
const ROLE_TO_REMOVE_ID = '';
const SPECIFIC_CHANNEL_ID = ''; // قناة إعطاء الرتب
const TARGET_CHANNEL_ID = '';   // قناة ip
const STAFF_ROLE_ID = '';       // رول 

const ROLE1_COLOR = '#FF5733';
const ROLE2_COLOR = '#33FF57';
const ROLE1_EMOJI = '<a:1151verifiedblackanimated:1370140968531263488>';
const ROLE2_EMOJI = '<a:1151verifiedblackanimated:1370140968531263488>';

const DATA_PATH = path.join(__dirname, 'role_log.json');

// دالة حفظ معلومات من أخذ الرتبة ومن أعطاه
function saveRoleLog(memberId, staffId) {
  let data = {};
  if (fs.existsSync(DATA_PATH)) {
    const raw = fs.readFileSync(DATA_PATH);
    data = JSON.parse(raw);
  }

  if (!data[memberId]) {
    data[memberId] = [];
  }

  data[memberId].push({
    staffId: staffId,
    time: new Date().toLocaleString()
  });

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// تحديث حالة البوت حسب عدد الستاف النشطين
async function updateStaffPresence() {
  const guild = client.guilds.cache.first();
  if (!guild) return;

  await guild.members.fetch();

  const activeStaffCount = guild.members.cache.filter(member =>
    member.roles.cache.has(STAFF_ROLE_ID) &&
    member.presence &&
    ['online', 'idle', 'dnd'].includes(member.presence.status)
  ).size;

  client.user.setPresence({
    activities: [{
      name: ` ${activeStaffCount} Staff Online`,
      type: 3
    }],
    status: 'idle'
  });
}

client.once('ready', () => {
  console.log(`<a:1151verifiedblackanimated:1370140968531263488> Logged in as ${client.user.tag}`);
  updateStaffPresence();
  setInterval(updateStaffPresence, 60_000);
});

client.on('presenceUpdate', updateStaffPresence);
client.on('guildMemberUpdate', updateStaffPresence);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.channel.id === SPECIFIC_CHANNEL_ID) {
    const target = message.mentions.members.first() ||
      await message.guild.members.fetch(message.content.trim()).catch(() => null);

    if (!target) {
      return message.reply('❌ Cannot find the member. Make sure you mention them or provide a valid ID.');
    }

    try {
      const removedRoles = [];

      if (target.roles.cache.has(ROLE_TO_REMOVE_ID)) {
        await target.roles.remove(ROLE_TO_REMOVE_ID);
        removedRoles.push(ROLE_TO_REMOVE_ID);
      }

      await target.roles.add(ROLE1_ID);
      await target.roles.add(ROLE2_ID);

      // حفظ من أعطى الرتبة ومن تم إعطاؤه
      saveRoleLog(target.id, message.author.id);

      // بناء رسالة الترحيب Embed مع حقل الآيبي
      const welcomeEmbed = new EmbedBuilder()
        .setColor('#33FF57')
        .setTitle('<:2d094fa06a8ab94c26c48ec4a8999032:1371462282655170561>   You have been granted the Whitelist role!')
        .addFields(
          { name: '<:7081website:1370110787238236291> Server', value: 'Unity RP', inline: true },
          { name: '<:Owner:1371163709736620093> Given by', value: `<@${message.author.id}>`, inline: true },
          { name: '<:vsl_search1:1371165251503919115> Channel', value: `<#${message.channel.id}>`, inline: true },
          { name: '<:7081website:1370110787238236291> Server IP', value: 'connect 83.147.29.218', inline: false },
          { name: '\u200B', value: '🎮 Join us now and enjoy your roleplay experience!' }
        )
        .setImage('https://media.discordapp.net/attachments/1371842781319925790/1373661121160155217/1098159761461084170.gif')
        .setTimestamp();

      // إرسال رسالة خاصة للعضو
      await target.send({ embeds: [welcomeEmbed] });

      // رسالة في قناة إعطاء الرتب توضح تحديث الرتب
      const embed = new EmbedBuilder()
        .setColor(ROLE1_COLOR)
        .setTitle('<a:1151verifiedblackanimated:1370140968531263488> Roles Updated')
        .setDescription(`The following roles were assigned to ${target.user.tag}`)
        .addFields(
          {
            name: 'New Roles Assigned:',
            value: `<@&${ROLE1_ID}> ${ROLE1_EMOJI}\n<@&${ROLE2_ID}> ${ROLE2_EMOJI}`,
            inline: false
          },
          {
            name: 'Role Removed:',
            value: removedRoles.length > 0
              ? removedRoles.map(id => `<@&${id}> (ID: ${id})`).join('\n')
              : 'The user did not have the role to be removed.',
            inline: false
          }
        )
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
      updateStaffPresence();

    } catch (error) {
      console.error('❗ Error during role update:', error);
      message.reply('❗ An error occurred while trying to update the roles.');
    }
  }

  if (message.channel.id === TARGET_CHANNEL_ID) {
    const content = message.content.trim().toLowerCase();

    if (content === 'ip') {
      await message.channel.send(
        `** <a:arrow:1371461717758050404> Hello ${message.author.toString()}!**\n` +
        `**\n` +
        `** <a:arrow:1371461717758050404> 𝐔𝐧𝐢𝐭𝐲 [𝐃𝐳] 𝐑𝐨𝐥𝐞 𝐏𝐥𝐚𝐲 𝐒𝟏 ip : connect 83.147.29.218\n` +
        `**\n` +
        `**<:2d094fa06a8ab94c26c48ec4a8999032:1371462282655170561> ** ** Enjoy <3`
      );
    }
  }
});

client.login(TOKEN);
