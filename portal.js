// CORE CONNECT Academy - Student Portal Logic

document.addEventListener('DOMContentLoaded', () => {
    checkAcademySession();
    setupTabListeners();
    setupPresetButtons();
});

// 1. Session & Authentication Management
function checkAcademySession() {
    const session = JSON.parse(localStorage.getItem('academy_session'));
    const loginSection = document.getElementById('loginSection');
    const portalSection = document.getElementById('portalSection');
    
    if (session) {
        // Logged in
        if (loginSection) loginSection.style.display = 'none';
        if (portalSection) portalSection.style.display = 'block';
        
        // Update header & badges
        const schoolEl = document.getElementById('displaySchool');
        const deptEl = document.getElementById('displayDept');
        const nameEl = document.getElementById('displayName');
        const studentIdEl = document.getElementById('displayStudentId');
        
        if (schoolEl) schoolEl.innerText = session.schoolName;
        if (deptEl) deptEl.innerText = `${session.grade} ${session.club ? '・' + session.club : ''}`;
        if (nameEl) nameEl.innerText = `${session.studentName} さん`;
        if (studentIdEl) studentIdEl.innerText = session.studentId;
        
        // Render Dashboard components
        renderConditionSummary();
        renderHrvTrendChart();
        loadAcademyArticles();
    } else {
        // Logged out
        if (loginSection) loginSection.style.display = 'flex';
        if (portalSection) portalSection.style.display = 'none';
    }
}

window.handleAcademyLogin = function(event) {
    if (event) event.preventDefault();
    const schoolCode = document.getElementById('schoolCode').value.trim();
    const schoolName = document.getElementById('schoolName').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const studentName = document.getElementById('studentName').value.trim();
    const grade = document.getElementById('studentGrade').value;
    const club = document.getElementById('studentClub').value;
    
    if (studentId && studentName) {
        const session = { schoolCode, schoolName, studentId, studentName, grade, club };
        localStorage.setItem('academy_session', JSON.stringify(session));
        
        // Seed mock history if empty
        seedMockHistoryIfEmpty(grade);
        
        checkAcademySession();
    }
};

window.handleAcademyLogout = function() {
    localStorage.removeItem('academy_session');
    location.reload();
};

// Preset Profiles for quick demo switching
function setupPresetButtons() {
    window.applyPreset = function(type) {
        if (type === 'highschool') {
            document.getElementById('schoolCode').value = 'ACAD-HS-01';
            document.getElementById('schoolName').value = '桜ヶ丘高等学校';
            document.getElementById('studentId').value = 'HS-2026-084';
            document.getElementById('studentName').value = '佐藤 陽菜';
            document.getElementById('studentGrade').value = '高校2年生 (理系特進)';
            document.getElementById('studentClub').value = '吹奏楽部';
        } else if (type === 'university') {
            document.getElementById('schoolCode').value = 'ACAD-UNIV-09';
            document.getElementById('schoolName').value = '青葉国際大学';
            document.getElementById('studentId').value = 'UNIV-23-4412';
            document.getElementById('studentName').value = '田中 蓮';
            document.getElementById('studentGrade').value = '大学3年生 (理工学部)';
            document.getElementById('studentClub').value = '就活対策 / プログラミングサークル';
        } else if (type === 'athlete') {
            document.getElementById('schoolCode').value = 'ACAD-ATHLETE-03';
            document.getElementById('schoolName').value = '中央体育大学付属';
            document.getElementById('studentId').value = 'ATH-19-0032';
            document.getElementById('studentName').value = '高橋 健太';
            document.getElementById('studentGrade').value = '高校3年生 (アスリート専攻)';
            document.getElementById('studentClub').value = '陸上競技部 (全国大会目標)';
        }
    };
}

function seedMockHistoryIfEmpty(grade) {
    const history = JSON.parse(localStorage.getItem('academy_hrv_history') || '[]');
    if (history.length === 0) {
        const mockDates = ["8/27 (朝)", "8/28 (朝)", "8/29 (模試後)", "8/30 (朝)", "8/31 (部活後)", "9/01 (朝)"];
        const mockHrv = [54, 48, 32, 58, 44, 62]; // RMSSD in ms
        const mockHr = [68, 72, 84, 66, 75, 64];
        const mockCondition = ["良好", "通常", "過緊張・要休養", "良好", "やや疲労", "絶好調 (自律神経覚醒)"];
        
        const seeded = mockDates.map((d, i) => ({
            date: d,
            hrv: mockHrv[i],
            hr: mockHr[i],
            condition: mockCondition[i],
            tag: i === 2 ? '模試' : (i === 4 ? '部活' : '通常')
        }));
        localStorage.setItem('academy_hrv_history', JSON.stringify(seeded));
    }
}

// 2. Condition Summary Rendering
function renderConditionSummary() {
    const history = JSON.parse(localStorage.getItem('academy_hrv_history') || '[]');
    const latest = history.length > 0 ? history[history.length - 1] : { hrv: 58, hr: 66, condition: "良好" };
    
    const hrvScoreEl = document.getElementById('latestHrvScore');
    const hrValEl = document.getElementById('latestHrVal');
    const conditionBadgeEl = document.getElementById('latestConditionBadge');
    const adviceTextEl = document.getElementById('conditionAdviceText');
    
    if (hrvScoreEl) hrvScoreEl.innerText = `${latest.hrv} ms`;
    if (hrValEl) hrValEl.innerText = `${latest.hr} bpm`;
    
    if (conditionBadgeEl) {
        conditionBadgeEl.innerText = latest.condition;
        if (latest.hrv >= 55) {
            conditionBadgeEl.className = 'badge badge-green';
        } else if (latest.hrv >= 40) {
            conditionBadgeEl.className = 'badge badge-blue';
        } else {
            conditionBadgeEl.className = 'badge badge-orange';
        }
    }
    
    const savedLatestAdvice = localStorage.getItem('academy_latest_advice');
    
    if (adviceTextEl) {
        if (savedLatestAdvice) {
            adviceTextEl.innerHTML = `<span style="font-size:11px; font-weight:800; color:var(--accent-blue); display:block; margin-bottom:4px;">🧠 AI専属トレーナー処方箋 (久保医師監修アルゴリズム)</span>${savedLatestAdvice}`;
        } else if (latest.hrv >= 55) {
            adviceTextEl.innerHTML = '✨ <strong>自律神経バランスは絶好調です！</strong> 副交感神経がしっかり働き、回復力と集中力が高まっています。大事な試験勉強や実力発揮に最適なコンディションです。';
        } else if (latest.hrv >= 40) {
            adviceTextEl.innerHTML = '⚡ <strong>適度な活動バランスを維持しています。</strong> 授業や勉強の合間に、5分間の肩甲骨ストレッチや深呼吸を取り入れてリフレッシュを心がけましょう。';
        } else {
            adviceTextEl.innerHTML = '⚠️ <strong>自律神経が交感神経優位（緊張・疲労気味）です。</strong> 睡眠不足や過度なストレスのサインかもしれません。今夜はスマホを30分早く置き、湯船に浸かってしっかり休みましょう。';
        }
    }
}

// 3. HRV Trend Chart
function renderHrvTrendChart() {
    const container = document.getElementById('hrvChart');
    if (!container) return;
    
    const history = JSON.parse(localStorage.getItem('academy_hrv_history') || '[]');
    container.innerHTML = '';
    
    if (history.length === 0) {
        container.innerHTML = '<div class="empty-chart-state">まだ測定履歴がありません。<br>カメラで30秒スキャンを実施すると、ここに自律神経の推移が記録されます。</div>';
        return;
    }
    
    const maxHrv = Math.max(...history.map(h => h.hrv), 70);
    
    history.forEach(item => {
        const point = document.createElement('div');
        point.className = 'trend-point';
        
        const heightPct = Math.max(15, Math.min(95, (item.hrv / maxHrv) * 100));
        
        // Color coding
        let barColor = 'linear-gradient(180deg, var(--accent-sky), var(--accent-blue))';
        if (item.hrv < 38) {
            barColor = 'linear-gradient(180deg, var(--accent-orange), var(--accent-red))';
        } else if (item.hrv >= 55) {
            barColor = 'linear-gradient(180deg, #34d399, #059669)';
        }
        
        point.innerHTML = `
            <div class="trend-bar" style="height: ${heightPct}%; background: ${barColor};" data-val="${item.hrv}ms (${item.condition})"></div>
            <div class="trend-date">${item.date}</div>
        `;
        container.appendChild(point);
    });
}

// 4. Tab & Academy Articles
const ACADEMY_ARTICLES = {
    study: [
        {
            id: 'study-1',
            tag: '集中力・試験対策',
            tagColor: 'badge-blue',
            title: '模試・定期テスト直前の「1分間リセット呼吸（Box Breathing）」',
            desc: '米海軍特殊部隊やトップアスリートも実践する、過度な緊張や焦りを静めて前頭葉の集中力を取り戻す科学的呼吸法。',
            readTime: '3分',
            content: `
                <h4>テスト前や面接直前の「頭が真っ白」を防ぐ科学</h4>
                <p>強いプレッシャーがかかると、交感神経が急激に過活動となり、心拍数が上昇して脳の論理的思考エリア（前頭前野）への血流が低下します。</p>
                <h4>実践：4秒ボックス呼吸（Box Breathing）</h4>
                <ol>
                    <li>息を4秒かけてゆっくり鼻から吸う</li>
                    <li>肺を満たした状態で息を4秒止める</li>
                    <li>4秒かけて口から細く長く吐き出す</li>
                    <li>息を吐ききった状態で4秒止める</li>
                </ol>
                <p>これをわずか4サイクル（約1分間）繰り返すだけで、副交感神経が刺激されて心拍変動（RMSSD）が向上し、落ち着いた集中状態に入ることができます。</p>
            `
        },
        {
            id: 'study-2',
            tag: '就職活動・面接',
            tagColor: 'badge-purple',
            title: '大学3・4年生向け：面接やガクチカ本番で声が震えないメンタル自律神経術',
            desc: '就活面接での過度な心拍上昇をコントロール。面接控え室でできる非言語コンディショニング。',
            readTime: '4分',
            content: `
                <h4>面接での緊張は「準備ができている証拠」</h4>
                <p>適度な緊張はパフォーマンスを高めますが、自律神経が乱れすぎると声が上ずったり思考がまとまらなくなります。</p>
                <h4>面接5分前のルーティン</h4>
                <ul>
                    <li><strong>足の裏をしっかり床につける</strong>（グランディングで重心を安定させる）</li>
                    <li><strong>吐く息を吸う息の2倍の長さに</strong>（吐く動作は副交感神経を優位にします）</li>
                    <li><strong>肩甲骨を寄せて胸郭を広げる</strong>（姿勢が整うと呼吸が深くなります）</li>
                </ul>
            `
        },
        {
            id: 'study-3',
            tag: '記憶定着',
            tagColor: 'badge-indigo',
            title: '暗記と自律神経：夜の勉強と朝の復習を最大化するゴールデンサイクル',
            desc: '睡眠中の自律神経（徐波睡眠）が記憶の定着を促すメカニズムと、夜遅くの無理な詰め込みを避けるべき理由。',
            readTime: '3分',
            content: `
                <h4>脳は「深い眠りの中」で記憶を整理・定着させる</h4>
                <p>深夜まで交感神経を高ぶらせて暗記しても、睡眠の質が低いと海馬から大脳皮質への記憶転送が阻害されます。</p>
                <p>暗記科目は就寝前30分に行い、スマホを見ずにリラックスして就寝。翌朝起きてすぐに10分復習するのが最も効率的なサイクルです。</p>
            `
        }
    ],
    sleep: [
        {
            id: 'sleep-1',
            tag: '起立性調節障害(OD)・朝ケア',
            tagColor: 'badge-orange',
            title: '「朝起きられない」「身体が重い」高校生・大学生のための朝の自律神経覚醒スイッチ',
            desc: '思春期・青年期に多い自律神経の血圧・脈拍調節遅れ（起立性調節障害）のメカニズムと、布団の中でできる3つのリセット動作。',
            readTime: '4分',
            content: `
                <h4>なぜ朝がつらいのか？（思春期・青年期の身体の変化）</h4>
                <p>10代〜20代前半は身体の成長やホルモンバランスの変化に伴い、自律神経の切り替え（副交感神経から交感神経へ）に時間がかかる傾向があります。これは本人の「怠惰」ではなく、身体の生理的現象です。</p>
                <h4>布団の中でできる3つの覚醒ステップ</h4>
                <ol>
                    <li><strong>手足のグーパー運動</strong>: 布団の中で手足を20回グーパーして末梢の血流を心臓に戻す。</li>
                    <li><strong>カーテンを開けて日光を浴びる</strong>: 網膜からセロトニン分泌を促し、体内時計をリセット。</li>
                    <li><strong>コップ1杯の常温水</strong>: 胃腸を刺激して自律神経の覚醒スイッチを入れる。</li>
                </ol>
            `
        },
        {
            id: 'sleep-2',
            tag: 'スマホ・夜更かし対策',
            tagColor: 'badge-pink',
            title: '深夜のSNS・ショート動画ループから抜け出す「スマホ断捨離15分ルール」',
            desc: 'ブルーライトとドーパミン過剰刺激による自律神経の過覚醒を防ぎ、翌日のHRVスコアを回復させる夜の過ごし方。',
            readTime: '3分',
            content: `
                <h4>スマホのショート動画が自律神経を削る理由</h4>
                <p>次々と新しい情報や刺激が脳に与えられると、ドーパミンが分泌され続け、交感神経が夜間も高止まりします。これにより、寝ている間も心拍数が下がらず（RMSSDが低下）、朝起きた時のだるさにつながります。</p>
                <h4>今日からできる「就寝前15分のベッド外チャージ」</h4>
                <p>充電器をベッドの手が届く場所から離れた机の上に置く。たったこれだけで、就寝前の無意識なスクロールを劇的に防止できます。</p>
            `
        }
    ],
    sports: [
        {
            id: 'sports-1',
            tag: '部活動・コンディショニング',
            tagColor: 'badge-green',
            title: '学生アスリートのためのHRVモニタリング：怪我とオーバートレーニングを防ぐ',
            desc: 'プロ選手も導入する「HRV（心拍変動）によるその日の練習強度調整」。疲労が蓄積している日の賢いセーブ方法。',
            readTime: '4分',
            content: `
                <h4>HRVが低い日は「怪我のリスクが3倍」</h4>
                <p>筋肉痛がなくても、神経系の疲労によりRMSSD値が通常より20%以上低下している場合、反射速度やフォームの維持能力が落ち、靭帯損傷や肉離れのリスクが跳ね上がります。</p>
                <h4>HRVスコアに応じたトレーニング調整法</h4>
                <ul>
                    <li><strong>HRV高（グリーン）</strong>: 高強度インターバルや追い込み練習に最適！</li>
                    <li><strong>HRV通常（ブルー）</strong>: 通常メニュー・戦術練習</li>
                    <li><strong>HRV低（オレンジ・レッド）</strong>: フォーム確認、ストレッチ、アクティブレスト（動的休養）に切り替える勇気を持つ。</li>
                </ul>
            `
        },
        {
            id: 'sports-2',
            tag: '栄養・リカバリー',
            tagColor: 'badge-teal',
            title: '部活後の30分が勝負！自律神経を素早くリラックスモードに戻すプロテイン＆水分補給',
            desc: '運動直後の過熱した身体をクールダウンし、速やかな筋肉修復と翌日への疲労持ち越しを防ぐリカバリー術。',
            readTime: '3分',
            content: `
                <h4>練習直後は「交感神経の暴走」を鎮める</h4>
                <p>激しい練習直後は消化器官への血流が低下しています。激しい運動後15〜30分以内に、アミノ酸や糖質を含む水分を摂取し、ぬるめのシャワーで体温を整えることで、スムーズに副交感神経へスイッチできます。</p>
            `
        }
    ],
    mental: [
        {
            id: 'mental-1',
            tag: '人間関係・SNS疲れ',
            tagColor: 'badge-purple',
            title: '友達関係やグループLINEで心が疲れた時の「デジタルマインドフルネス」',
            desc: '常に他人の目が気になったり即レス義務感に追われる若者のための、心の境界線を引くヒント。',
            readTime: '4分',
            content: `
                <h4>「常時接続」が脳を慢性疲労にする</h4>
                <p>通知のたびに微細なストレスホルモン（コルチゾール）が分泌されます。「今すぐ返信しなくても大丈夫」と自分に言い聞かせ、1日の中で完全に通知を切る「自分のための1時間」を確保しましょう。</p>
            `
        },
        {
            id: 'mental-2',
            tag: 'SOS・孤立防止',
            tagColor: 'badge-red',
            title: '「辛い」を抱え込まないで：スクールカウンセラーや相談室を上手に頼る方法',
            desc: '学校の相談室は「深刻な問題がなくても、話を聞いてもらうだけでOK」な場所。プライバシーの守られ方と相談の流れ。',
            readTime: '3分',
            content: `
                <h4>相談することは「弱さ」ではなく「賢い戦略」</h4>
                <p>トップビジネスマンやアスリートもメンタルコーチを雇っています。スクールカウンセラーや保健室の先生は、あなたの自律神経や心の状態を客観的に整えるプロフェッショナルです。</p>
                <p>本プラットフォームの「相談室予約」から、匿名または直接予約が可能です。話がまとまっていなくても「なんとなくモヤモヤする」という理由だけで十分です。</p>
            `
        }
    ]
};

function setupTabListeners() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const category = tab.getAttribute('data-tab');
            loadAcademyArticles(category);
        });
    });
}

function loadAcademyArticles(category = 'study') {
    const grid = document.getElementById('articleGrid');
    if (!grid) return;
    
    const articles = ACADEMY_ARTICLES[category] || ACADEMY_ARTICLES['study'];
    grid.innerHTML = '';
    
    articles.forEach(art => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `
            <div>
                <span class="badge ${art.tagColor}" style="margin-bottom: 8px;">${art.tag}</span>
                <div class="article-title">${art.title}</div>
                <div class="article-desc" style="margin-top: 6px;">${art.desc}</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; font-size:11px; color:var(--text-muted);">
                <span>📖 読了目安: ${art.readTime}</span>
                <span style="color:var(--accent-blue); font-weight:700;">詳しく読む ➔</span>
            </div>
        `;
        card.onclick = () => openArticleModal(art);
        grid.appendChild(card);
    });
}

// Modal Functions
window.openArticleModal = function(article) {
    const modal = document.getElementById('articleModal');
    const titleEl = document.getElementById('modalArticleTitle');
    const bodyEl = document.getElementById('modalArticleBody');
    const badgeEl = document.getElementById('modalArticleBadge');
    
    if (titleEl) titleEl.innerText = article.title;
    if (bodyEl) bodyEl.innerHTML = article.content;
    if (badgeEl) {
        badgeEl.className = `badge ${article.tagColor}`;
        badgeEl.innerText = article.tag;
    }
    
    if (modal) modal.classList.add('active');
};

window.closeArticleModal = function() {
    const modal = document.getElementById('articleModal');
    if (modal) modal.classList.remove('active');
};

window.openConsultModal = function() {
    const modal = document.getElementById('consultModal');
    if (modal) modal.classList.add('active');
};

window.closeConsultModal = function() {
    const modal = document.getElementById('consultModal');
    if (modal) modal.classList.remove('active');
};

window.submitConsultRequest = function(event) {
    event.preventDefault();
    const type = document.getElementById('consultType').value;
    const memo = document.getElementById('consultMemo').value;
    const isAnon = document.getElementById('consultAnon').checked;
    
    alert(`✅ ご相談リクエストを受け付けました。\n相談種別: ${type}\n${isAnon ? '（匿名相談モード）' : ''}\n\nスクールカウンセラー・保健室教諭から追ってご連絡いたします。`);
    closeConsultModal();
};

// ==========================================
// Fullscreen Action Modals (Breathing, Eye, Stretch)
// ==========================================

// 1. Breathing Modal Logic
let portalBreathInterval = null;
window.openBreathingModal = function() {
    const modal = document.getElementById('breathingModal');
    if (!modal) return;
    modal.classList.add('active');
    
    const circle = document.getElementById('breathCircle');
    const phaseText = document.getElementById('breathPhaseText');
    const timerEl = document.getElementById('breathTimer');
    
    let timeLeft = 60;
    let step = 0;
    
    function updatePhase() {
        if (!circle || !phaseText) return;
        if (step === 0) {
            circle.className = 'breath-circle expand';
            phaseText.innerText = '吸って (4s)';
        } else if (step === 1) {
            circle.className = 'breath-circle expand';
            phaseText.innerText = '止めて (4s)';
        } else if (step === 2) {
            circle.className = 'breath-circle contract';
            phaseText.innerText = '吐いて (4s)';
        } else if (step === 3) {
            circle.className = 'breath-circle contract';
            phaseText.innerText = '止めて (4s)';
        }
        step = (step + 1) % 4;
    }

    updatePhase();
    if (portalBreathInterval) clearInterval(portalBreathInterval);
    portalBreathInterval = setInterval(() => {
        timeLeft -= 4;
        if (timeLeft <= 0) {
            clearInterval(portalBreathInterval);
            if (timerEl) timerEl.innerText = '✨ 1分間完了！自律神経が整いました。';
            if (phaseText) phaseText.innerText = '完了！';
            return;
        }
        if (timerEl) timerEl.innerText = `残り時間: ${timeLeft}秒`;
        updatePhase();
    }, 4000);
};

window.closeBreathingModal = function() {
    const modal = document.getElementById('breathingModal');
    if (modal) modal.classList.remove('active');
    if (portalBreathInterval) clearInterval(portalBreathInterval);
};

// 2. Eye Game Modal Logic
let portalEyeInterval = null;
let portalEyeAnimId = null;
window.openEyeGameModal = function() {
    const modal = document.getElementById('eyeGameModal');
    if (!modal) return;
    modal.classList.add('active');
    
    const gameCanvas = document.getElementById('eyeGameCanvas');
    if (!gameCanvas) return;
    const gCtx = gameCanvas.getContext('2d');
    
    setTimeout(() => {
        gameCanvas.width = gameCanvas.clientWidth || window.innerWidth * 0.9;
        gameCanvas.height = gameCanvas.clientHeight || (window.innerHeight - 240);

        let x = gameCanvas.width / 2;
        let y = gameCanvas.height / 2;
        let speed = Math.max(4.5, gameCanvas.width / 180);
        let dx = speed;
        let dy = speed * 0.8;
        const radius = Math.max(16, gameCanvas.width / 50);

        let timeLeft = 30;
        const timerEl = document.getElementById('eyeGameTimer');
        const scoreEl = document.getElementById('eyeGameScore');
        if (scoreEl) scoreEl.innerText = '🎯 ターゲット追従中... (頭を動かさず目だけで追う)';

        if (portalEyeInterval) clearInterval(portalEyeInterval);
        portalEyeInterval = setInterval(() => {
            timeLeft--;
            if (timerEl) timerEl.innerText = `残り: ${timeLeft}秒`;
            if (timeLeft <= 0) {
                clearInterval(portalEyeInterval);
                if (scoreEl) scoreEl.innerText = '🎉 30秒眼筋ストレッチ完了！視野と脳の緊張がほぐれました。';
            }
        }, 1000);

        function drawGame() {
            gCtx.fillStyle = 'rgba(15, 23, 42, 0.22)';
            gCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

            // Ambient trail
            gCtx.beginPath();
            gCtx.arc(x, y, radius, 0, Math.PI * 2);
            gCtx.fillStyle = '#ec4899';
            gCtx.shadowColor = '#f472b6';
            gCtx.shadowBlur = 30;
            gCtx.fill();
            gCtx.shadowBlur = 0;

            // Inner core
            gCtx.beginPath();
            gCtx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
            gCtx.fillStyle = '#ffffff';
            gCtx.fill();

            x += dx;
            y += dy;

            if (x + radius > gameCanvas.width || x - radius < 0) dx = -dx;
            if (y + radius > gameCanvas.height || y - radius < 0) dy = -dy;

            if (timeLeft > 0) {
                portalEyeAnimId = requestAnimationFrame(drawGame);
            }
        }

        drawGame();
    }, 100);
};

window.closeEyeGameModal = function() {
    const modal = document.getElementById('eyeGameModal');
    if (modal) modal.classList.remove('active');
    if (portalEyeInterval) clearInterval(portalEyeInterval);
    if (portalEyeAnimId) cancelAnimationFrame(portalEyeAnimId);
};

// 3. Stretch Modal Logic
let portalStretchInterval = null;
window.openStretchModal = function() {
    const modal = document.getElementById('stretchModal');
    if (!modal) return;
    modal.classList.add('active');
    
    let timeLeft = 60;
    const timerEl = document.getElementById('stretchTimerText');
    const iconEl = document.getElementById('stretchIcon');
    const titleEl = document.getElementById('stretchStepTitle');
    const descEl = document.getElementById('stretchStepDesc');
    const progressEl = document.getElementById('stretchProgress');

    function updateStep(sec) {
        if (!progressEl) return;
        const progress = ((60 - sec) / 60) * 100;
        progressEl.style.width = `${progress}%`;

        if (sec > 40) {
            iconEl.innerText = "🔄";
            titleEl.innerText = "Step 1: 肩甲骨ぐるぐる回し (20秒)";
            descEl.innerHTML = "両手を肩に乗せ、肘で大きな円を描くように後ろへゆっくり回します。<br>胸郭を開いて深く息を吸いましょう。";
        } else if (sec > 20) {
            iconEl.innerText = "💆";
            titleEl.innerText = "Step 2: 首すじ・側頭部ストレッチ (20秒)";
            descEl.innerHTML = "頭をゆっくり左へ倒し、右の首すじを心地よく伸ばします（10秒で反対側へ）。<br>脳への血流ルート（椎骨動脈）の緊張を解放します。";
        } else {
            iconEl.innerText = "🙆";
            titleEl.innerText = "Step 3: 両手を組んでぐ〜っと背伸び (20秒)";
            descEl.innerHTML = "頭上で両手を組み、手のひらを上に向けて天井へ背伸びします。<br>息を吐きながら身体を左右に軽く揺らしましょう。";
        }
        if (timerEl) timerEl.innerText = `残り時間: ${sec}秒`;
    }

    updateStep(timeLeft);
    if (portalStretchInterval) clearInterval(portalStretchInterval);
    portalStretchInterval = setInterval(() => {
        timeLeft--;
        updateStep(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(portalStretchInterval);
            if (progressEl) progressEl.style.width = "100%";
            if (iconEl) iconEl.innerText = "✨";
            if (titleEl) titleEl.innerText = "🎉 1分間ストレッチ完了！";
            if (descEl) descEl.innerHTML = "肩甲骨と首の緊張がほぐれ、脳と全身への血流がスムーズになりました！";
            if (timerEl) timerEl.innerText = "リフレッシュ完了！";
        }
    }, 1000);
};

window.closeStretchModal = function() {
    const modal = document.getElementById('stretchModal');
    if (modal) modal.classList.remove('active');
    if (portalStretchInterval) clearInterval(portalStretchInterval);
};
    alert(`【相談リクエスト送信完了】\n\nご希望: ${type}\n匿名希望: ${isAnon ? 'はい（統計IDのみ送信）' : 'いいえ（学籍番号を連携）'}\n\nスクールカウンセラー・保健室スタッフに通知が届きました。安心して学校生活をお過ごしください。`);
    closeConsultModal();
};
