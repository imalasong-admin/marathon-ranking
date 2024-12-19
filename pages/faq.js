// pages/faq.js
import { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, HelpCircle, Award, Shield, Settings, Users, Clock } from 'lucide-react';

export default function FAQ() {
  // 控制每个部分的展开/折叠状态
  const [openSections, setOpenSections] = useState({
    purpose: true,    // 默认展开第一个
    rankings: false,
    verification: false,
    modification: false,
    user: false,
    operation: false,
    cooperation: false,
    contact: false
  });

  // 切换展开/折叠状态
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // FAQ 部分的样式类
  const sectionClass = "border rounded-lg bg-white shadow-sm overflow-hidden mb-4";
  const headerClass = "flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50";
  const headerTitleClass = "flex items-center space-x-3 text-lg font-medium text-gray-900";
  const contentClass = "px-4 pb-4 text-gray-600 space-y-3";
  const iconClass = "w-5 h-5 text-blue-500";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">常见问题</h1>
        
        {/* 第一部分：意义 */}
        <div className={sectionClass}>
          <div 
            className={headerClass} 
            onClick={() => toggleSection('purpose')}
          >
            <div className={headerTitleClass}>
              <HelpCircle className={iconClass} />
              <span>北美华人跑榜有何意义？</span>
            </div>
            {openSections.purpose ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openSections.purpose && (
            <div className={contentClass}>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="font-medium text-blue-900">简短说：</p>
                <p>多维度统计并展示北美华人马拉松跑者的比赛数据。</p>
              </div>
              <p className="mt-3">
                华人在北美地区蓬勃发展，其中的马拉松跑者充满活力、积极向上，作为参赛者或志愿者，活跃在世界各地的马拉松和超马赛场。华人跑团遍及北美各地，具有广泛的影响力。
              </p>
              <p>
              北美华人马拉松跑者有多少人？跑了多少场比赛？取得了怎样的成绩？在性别、年龄段、地区是如何分布的？谁跑得快？谁跑得强？谁跑得长？谁跑得多？这些都是有意义且有意思的数据。
              </p>
              <p>
                希望长期居住在北美地区的华人跑者，提交比赛成绩，共同丰富这些数据，让数据趋近真实。跑者在跑者的地盘，为自己完赛上榜开心，为佼佼者鼓掌欢呼，展现我们北美华人跑者的自信与风采。
              </p>
            </div>
          )}
        </div>

        {/* 第二部分：榜单 */}
        <div className={sectionClass}>
          <div 
            className={headerClass}
            onClick={() => toggleSection('rankings')}
          >
            <div className={headerTitleClass}>
              <Award className={iconClass} />
              <span>2024年度有什么榜单？</span>
            </div>
            {openSections.rankings ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openSections.rankings && (
            <div className={contentClass}>
              <div className="space-y-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2">
                    <li>• <span className="font-medium">2024马拉松完赛榜：</span></li>
                    <p className="px-3 text-sm text-gray-500">全程马拉松比赛的完赛成绩列表。</p>
                    <li>• <span className="font-medium">2024马拉松超马越野榜：</span></li>
                    <p className="px-3 text-sm text-gray-500">全马距离以上，包括计时赛、多日赛等形式的正式超马比赛的完赛成绩列表。</p>
                  </ul>
                  <p className="mt-2 text-sm text-gray-600">这两个榜按比赛日期排序，是所有统计数据的源头。请北美华人跑者提交比赛成绩，成绩上榜让统计数据更丰富真实。上榜跑者还有机会获取福利。</p>
                </div>

                <div className="p-3 space-y-1">
                <ul className="space-y-1">
                    <li>• <span className="font-medium">2024马拉松跑力榜：</span></li>
                    <p className="px-3 text-sm text-gray-500">消除了性别和年龄差异后的马拉松成绩榜单，可视为马拉松综合实力排行。按实力排序。</p>
                    <li>• <span className="font-medium">2024马拉松男子女子百强榜：</span></li>
                    <p className="px-3 text-sm text-gray-500">2024年度北美华人跑者，男子女子分别最快的100人。</p>
                    <li>• <span className="font-medium">2024马拉松BQ榜：</span></li>
                    <p className="px-3 text-sm text-gray-500">2024年度达到BQ的跑者列表，快于BQ标准越多排序越靠前。采用<a href="https://www.baa.org/races/boston-marathon/qualify" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">2025 BOSTON MARATHON QUALIFYING TIMES</a></p>
                    <li>• <span className="font-medium">2024百英里超级跑者榜：</span></li>
                    <p className="px-3 text-sm text-gray-500">按比赛日期排序，北美华人跑者在2024年度完成的百英里比赛成绩列表。</p>
                  </ul>
                
                 
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 第三部分：验证 */}
        <div className={sectionClass}>
          <div 
            className={headerClass}
            onClick={() => toggleSection('verification')}
          >
            <div className={headerTitleClass}>
              <Shield className={iconClass} />
              <span>比赛成绩如何验证？</span>
            </div>
            {openSections.verification ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openSections.verification && (
            <div className={contentClass}>
              <ul className="space-y-3">
                <li>• 比赛成绩由跑者本人提交，真实有效性本人承担。如果跑者能提供该成绩的链接，如比赛官网的该成绩链接、Strava上该成绩的activity link、Athlink上的该成绩链接，则是更清晰的证明。</li>
                <li>• 成绩链接可以在提交成绩时录入，也可以在个人中心的本人成绩列表录入，录入后不能再修改。</li>
                <li>• 跑榜还有一个针对成绩的验证机制，任何注册用户都可以在看到任何人的比赛成绩后，查看成绩链接或基于自己对这位跑者的了解，给出验证或质疑的评价。</li>
                <li>• 如果认为成绩不属于长期居住在北美地区的跑者，也可对该成绩给于质疑的评价。</li>
              </ul>
            </div>
          )}
        </div>

        {/* 第四部分：修改 */}
        <div className={sectionClass}>
          <div 
            className={headerClass}
            onClick={() => toggleSection('modification')}
          >
            <div className={headerTitleClass}>
              <Settings className={iconClass} />
              <span>如何修改注册信息、比赛成绩？</span>
            </div>
            {openSections.modification ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openSections.modification && (
            <div className={contentClass}>
              <ul className="space-y-3">
                <li>• 修改注册信息、比赛成绩会影响统计数据和榜单排行，因此请注册时、提交成绩时确保信息的准确和有效。</li>
                <li>• 如果确实需要修改，请联系跑榜管理员: <a href="mailto:Admin@iMaLaSong.com" className="text-blue-600 hover:underline">Admin@iMaLaSong.com</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* 第五部分：用户注册 */}
        <div className={sectionClass}>
          <div 
            className={headerClass}
            onClick={() => toggleSection('user')}
          >
            <div className={headerTitleClass}>
              <Users className={iconClass} />
              <span>用户注册及权限说明</span>
            </div>
            {openSections.user ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openSections.user && (
            <div className={contentClass}>
              <ul className="space-y-3">
                <li>• 北美华人跑榜希望所列皆为真实有效的比赛成绩，欢迎长期居住在北美地区的华人马拉松跑者注册。</li>
                <li>• 请填写和注册比赛时一致的姓名、性别、生日等基本信息。</li>
                <li>• 注册后即可提交比赛成绩，成绩上榜并计入统计数据。请尽快验证注册email。</li>
                <li>• 邮件地址被验证，且有成绩上榜的注册用户，才有机会获取福利，有权利对其他跑者的比赛成绩进行验证或质疑。</li>
                
                <li>• 如果注册信息不真实、提交成绩不真实、注册邮件地址没有被验证、注册后不提交比赛成绩、无理由质疑其他跑者比赛成绩等，跑榜有权锁定用户使其无法登录网站。</li>
                <li>• 北美华人跑榜非盈利，对注册用户的数量、浏览量等数据没有追求。</li>
              </ul>
            </div>
          )}
        </div>

        {/* 第六部分：运营 */}
        <div className={sectionClass}>
          <div 
            className={headerClass}
            onClick={() => toggleSection('operation')}
          >
            <div className={headerTitleClass}>
              <Clock className={iconClass} />
              <span>北美华人跑榜如何运营？</span>
            </div>
            {openSections.operation ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openSections.operation && (
            <div className={contentClass}>
              <ul className="space-y-3">
                <li>• 北美华人跑榜刚刚开始运营并启动2024年度榜单，网站研发及运行所需费用皆有发起人承担。准备近期注册北美华人跑榜为非盈利组织。</li>
                <li>• 如有愿意捐助网站研发维护及运行费用的个人或商家，请联系：<a href="mailto:Tian@imalasong.com" className="text-blue-600 hover:underline">Tian@imalasong.com</a></li>
              </ul>
            </div>
          )}
        </div>

       {/* 第七部分：合作 续 */}
        <div className={sectionClass}>
          <div 
            className={headerClass}
            onClick={() => toggleSection('operation')}
          >
            <div className={headerTitleClass}>
              <Clock className={iconClass} />
              <span>北美华人跑榜有什么合作方式？</span>
            </div>
            {openSections.operation ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openSections.operation && (
            <div className={contentClass}>
              <ul className="space-y-3">
              <li>• 非常欢迎个人或商家成为赞助商，给各个榜单的上榜跑者提供福利。</li>
    <li>• 提供福利内容可以多种多样，例如跑步装备、奖金奖品、赞助代言等等。</li>
    <li>• 跑者获得福利的方式也可多种多样，抽奖、设定奖励标准、指定等等。</li>
    <li>• 成为赞助商的个人或商家，可以获得榜单冠名、网站广告位等回馈。</li>
    <li>• 跑榜欢迎任何能给跑者带来福利的合作方式。</li>
    <li>• 请跑者提供合作资源给跑者谋福利。</li>
    <li>• 合作联系方式：<a href="mailto:Tian@imalasong.com" className="text-blue-600 hover:underline">Tian@imalasong.com</a></li>
              </ul>
            </div>
          )}
        </div>

 


{/* 第八部分：联系方式 */}
<div className={sectionClass}>
  <div 
    className={headerClass}
    onClick={() => toggleSection('contact')}
  >
    <div className={headerTitleClass}>
      <Mail className={iconClass} />
      <span>有问题找谁联系？</span>
    </div>
    {openSections.contact ? <ChevronUp /> : <ChevronDown />}
  </div>
  {openSections.contact && (
    <div className={contentClass}>
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">网站技术支持</h3>
          <p>关于网站的使用、优化建议、发现错误、更改注册或比赛成绩信息等，请联系：</p>
          <a href="mailto:Admin@iMaLaSong.com" className="text-blue-600 hover:underline block mt-2">Admin@iMaLaSong.com</a>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">商务合作</h3>
          <p>关于捐助、合作、资源分享或任何商务方面事宜，请联系：</p>
          <a href="mailto:Tian@imalasong.com" className="text-blue-600 hover:underline block mt-2">Tian@imalasong.com</a>
        </div>
      </div>
    </div>
  )}
</div>
</div>
</div>
)}