/* كيف يفكر الذكاء الاصطناعي؟ — Interactive presentation, plain JavaScript */
(() => {
  'use strict';

  const slides = [...document.querySelectorAll('.slide')];
  const progressFill = document.getElementById('progressFill');
  const currentNumber = document.getElementById('currentNumber');
  const currentTitle = document.getElementById('currentTitle');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const rail = document.getElementById('chapterRail');
  const stage = document.getElementById('slidesStage');
  let currentSlide = 0;

  const dots = slides.map((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'rail-dot';
    dot.title = `${index + 1}. ${slide.dataset.title}`;
    dot.setAttribute('aria-label', dot.title);
    dot.addEventListener('click', () => showSlide(index));
    rail.appendChild(dot);
    return dot;
  });

  function showSlide(index) {
    const next = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, i) => {
      const active = i === next;
      slide.hidden = !active;
      slide.classList.toggle('is-active', active);
      if (active) slide.scrollTop = 0;
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === next);
      dot.setAttribute('aria-current', i === next ? 'step' : 'false');
    });
    currentSlide = next;
    currentNumber.textContent = String(next + 1).padStart(2, '0');
    currentTitle.textContent = slides[next].dataset.title;
    progressFill.style.width = `${((next + 1) / slides.length) * 100}%`;
    prevBtn.disabled = next === 0;
    nextBtn.innerHTML = next === slides.length - 1 ? 'إعادة العرض <span aria-hidden="true">↺</span>' : 'التالي <span aria-hidden="true">←</span>';
  }

  prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => showSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1));
  document.getElementById('restartBtn').addEventListener('click', () => showSlide(0));
  document.getElementById('logoLink').addEventListener('click', (event) => {
    event.preventDefault();
    showSlide(0);
  });
  document.querySelectorAll('[data-goto]').forEach(button => {
    button.addEventListener('click', () => showSlide(Number(button.dataset.goto)));
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    if (event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if (event.key === 'ArrowLeft' || event.key === 'PageDown') {
      event.preventDefault();
      showSlide(currentSlide + 1);
    } else if (event.key === 'ArrowRight' || event.key === 'PageUp') {
      event.preventDefault();
      showSlide(currentSlide - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      showSlide(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      showSlide(slides.length - 1);
    }
  });

  // Gesture navigation: ignore horizontal swipes that began on interactive controls.
  let pointerStart = null;
  stage.addEventListener('touchstart', (event) => {
    const target = event.target;
    if (target.closest('button, a, input, select, textarea')) return;
    const touch = event.changedTouches[0];
    pointerStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  stage.addEventListener('touchend', (event) => {
    if (!pointerStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - pointerStart.x;
    const dy = touch.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.55) {
      showSlide(currentSlide + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  const fullscreenBtn = document.getElementById('fullscreenBtn');
  fullscreenBtn.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    } catch (error) {
      fullscreenBtn.title = 'ملء الشاشة غير مدعوم في هذا المتصفح';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const inFullScreen = Boolean(document.fullscreenElement);
    fullscreenBtn.setAttribute('aria-label', inFullScreen ? 'إلغاء ملء الشاشة' : 'عرض بملء الشاشة');
    fullscreenBtn.title = inFullScreen ? 'إلغاء ملء الشاشة' : 'ملء الشاشة';
  });
  document.getElementById('printSlidesBtn').addEventListener('click', () => window.print());

  // Data representations (simplified, illustrative).
  const representations = {
    text: {
      title: 'النص ← رموز رقمية',
      description: 'يُقسّم النص عادةً إلى وحدات تسمى Tokens، ثم يحوّلها النموذج إلى تمثيلات عددية.',
      source: 'النص الأصلي',
      view: 'dataText'
    },
    image: {
      title: 'الصورة ← قيم بكسلات',
      description: 'تُحوَّل ألوان الصورة إلى أرقام، وقد تُعالَج على هيئة مناطق صغيرة أو تمثيلات بصرية أخرى.',
      source: 'الصورة الأصلية',
      view: 'dataImage'
    },
    audio: {
      title: 'الصوت ← عينات رقمية',
      description: 'تُمثَّل الموجة الصوتية بعينات أو ميزات عددية يمكن للنموذج استخراج الأنماط منها.',
      source: 'الصوت الأصلي',
      view: 'dataAudio'
    }
  };
  document.querySelectorAll('.data-tab').forEach(button => {
    button.addEventListener('click', () => {
      const chosen = representations[button.dataset.kind];
      document.querySelectorAll('.data-tab').forEach(tab => {
        const on = tab === button;
        tab.classList.toggle('active', on);
        tab.setAttribute('aria-pressed', String(on));
      });
      document.getElementById('dataTitle').textContent = chosen.title;
      document.getElementById('dataDesc').textContent = chosen.description;
      document.getElementById('dataInputLabel').textContent = chosen.source;
      document.querySelectorAll('.data-view').forEach(view => { view.hidden = view.id !== chosen.view; });
    });
  });

  // A real, tiny logistic-regression trainer for linearly separable synthetic data.
  // This represents one elementary learning algorithm, not how a full LLM is trained.
  const examples = [
    { x: .76, y: .62, label: 1 }, { x: .91, y: .72, label: 1 },
    { x: .73, y: .82, label: 1 }, { x: .91, y: .45, label: 1 },
    { x: .54, y: .88, label: 1 }, { x: .68, y: .69, label: 1 },
    { x: .13, y: .27, label: 0 }, { x: .18, y: .42, label: 0 },
    { x: .35, y: .24, label: 0 }, { x: .12, y: .69, label: 0 },
    { x: .43, y: .31, label: 0 }, { x: .30, y: .51, label: 0 }
  ];
  const ns = 'http://www.w3.org/2000/svg';
  const plot = document.getElementById('trainingPoints');
  examples.forEach(item => {
    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', String(30 + item.x * 240));
    circle.setAttribute('cy', String(270 - item.y * 240));
    circle.setAttribute('r', '7');
    circle.setAttribute('fill', item.label ? '#4be4d2' : '#b09aff');
    circle.setAttribute('stroke', '#10192a');
    circle.setAttribute('stroke-width', '2');
    plot.appendChild(circle);
  });
  const defaultWeights = () => ({ w1: -.45, w2: .38, b: -.12, epochs: 0 });
  let model = defaultWeights();
  let trainingTimer = null;
  const sigmoid = z => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
  const predict = item => sigmoid(model.w1 * item.x + model.w2 * item.y + model.b);
  function evaluate() {
    let loss = 0, correct = 0;
    examples.forEach(item => {
      const p = Math.min(1 - 1e-9, Math.max(1e-9, predict(item)));
      loss -= item.label * Math.log(p) + (1 - item.label) * Math.log(1 - p);
      correct += Number((p >= .5 ? 1 : 0) === item.label);
    });
    return { loss: loss / examples.length, accuracy: 100 * correct / examples.length };
  }
  function trainEpoch() {
    let d1 = 0, d2 = 0, db = 0;
    for (const item of examples) {
      const diff = predict(item) - item.label;
      d1 += diff * item.x;
      d2 += diff * item.y;
      db += diff;
    }
    const rate = .8 / examples.length;
    model.w1 -= rate * d1;
    model.w2 -= rate * d2;
    model.b -= rate * db;
    model.epochs++;
  }
  function decisionBoundary() {
    const candidates = [];
    const { w1, w2, b } = model;
    const check = (x, y) => {
      if (Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 1 && y >= 0 && y <= 1 && !candidates.some(p => Math.hypot(p.x - x, p.y - y) < .001)) {
        candidates.push({ x, y });
      }
    };
    if (Math.abs(w2) > 1e-6) { check(0, -b / w2); check(1, -(w1 + b) / w2); }
    if (Math.abs(w1) > 1e-6) { check(-b / w1, 0); check(-(w2 + b) / w1, 1); }
    const line = document.getElementById('decisionLine');
    if (candidates.length >= 2) {
      const [a, c] = candidates;
      line.setAttribute('x1', String(30 + a.x * 240));
      line.setAttribute('y1', String(270 - a.y * 240));
      line.setAttribute('x2', String(30 + c.x * 240));
      line.setAttribute('y2', String(270 - c.y * 240));
      line.style.opacity = '1';
    } else {
      line.style.opacity = '0';
    }
  }
  function updateTrainingUi() {
    const result = evaluate();
    document.getElementById('accuracyText').textContent = `${Math.round(result.accuracy)}%`;
    document.getElementById('lossText').textContent = result.loss.toFixed(2);
    document.getElementById('epochText').textContent = String(model.epochs);
    decisionBoundary();
  }
  document.getElementById('trainBtn').addEventListener('click', () => {
    if (trainingTimer) return;
    const btn = document.getElementById('trainBtn');
    btn.disabled = true;
    document.getElementById('trainingStatus').textContent = 'يجري تعديل الأوزان لتقليل الخطأ...';
    let steps = 0;
    trainingTimer = window.setInterval(() => {
      for (let i = 0; i < 3; i++) trainEpoch();
      steps++;
      updateTrainingUi();
      if (steps >= 24) {
        clearInterval(trainingTimer);
        trainingTimer = null;
        btn.disabled = false;
        document.getElementById('trainingStatus').textContent = 'تدريب مكتمل! جرّب التدريب مرة أخرى لترى كيف تتغيّر النتائج.';
      }
    }, 40);
  });
  document.getElementById('resetTrainBtn').addEventListener('click', () => {
    if (trainingTimer) clearInterval(trainingTimer);
    trainingTimer = null;
    document.getElementById('trainBtn').disabled = false;
    model = defaultWeights();
    updateTrainingUi();
    document.getElementById('trainingStatus').textContent = 'تمت إعادة النموذج إلى أوزان البداية.';
  });
  updateTrainingUi();

  // Predictions below are intentionally illustrative, not measured model scores.
  const predictions = [
    { sentence: '«الشمس تشرق من...»', options: [{ word: 'الشرق', p: 78 }, { word: 'الغرب', p: 14 }, { word: 'الشمال', p: 8 }] },
    { sentence: '«عند المطر نستخدم...»', options: [{ word: 'المظلّة', p: 72 }, { word: 'النظارة', p: 18 }, { word: 'الوسادة', p: 10 }] },
    { sentence: '«أول خطوة لحل المشكلة هي...»', options: [{ word: 'فهمها', p: 64 }, { word: 'تجاهلها', p: 25 }, { word: 'نسيانها', p: 11 }] }
  ];
  function showPrediction(preset) {
    const item = predictions[preset];
    document.getElementById('promptSentence').textContent = item.sentence;
    document.querySelectorAll('.preset').forEach(button => {
      const active = Number(button.dataset.preset) === preset;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const bars = document.getElementById('predictionBars');
    bars.replaceChildren();
    const result = document.getElementById('predictionResult');
    result.textContent = 'انقر خيارًا لتكتشف الفرق بين «الأكثر احتمالًا» و«الحقيقة».';
    item.options.forEach((option, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'prediction-choice';
      button.innerHTML = `<div class="prediction-choice-top"><span></span><span>${option.p}%</span></div><div class="prediction-track"><span style="width:${option.p}%"></span></div>`;
      button.querySelector('.prediction-choice-top span').textContent = option.word;
      button.setAttribute('aria-label', `${option.word}: ${option.p} بالمئة (احتمال توضيحي)`);
      button.addEventListener('click', () => {
        bars.querySelectorAll('.prediction-choice').forEach(b => b.classList.remove('selected'));
        button.classList.add('selected');
        result.textContent = i === 0 ? `«${option.word}» هو الأعلى في هذا المثال، لكنه ما زال توقعًا لا ضمانًا.` : `«${option.word}» خيار ممكن حسابيًا في المثال، لكنه أقل ترجيحًا من الخيار الأول.`;
      });
      bars.appendChild(button);
    });
  }
  document.querySelectorAll('.preset').forEach(button => button.addEventListener('click', () => showPrediction(Number(button.dataset.preset))));
  showPrediction(0);

  // Expandable error categories.
  document.querySelectorAll('.limit-card').forEach(card => {
    card.addEventListener('click', () => {
      const expanded = !card.classList.contains('open');
      card.classList.toggle('open', expanded);
      card.setAttribute('aria-expanded', String(expanded));
      card.querySelector('.limit-cta').textContent = expanded ? 'إخفاء التفاصيل −' : 'اضغط للاكتشاف +';
    });
  });

  // Single-question review.
  const quizButtons = [...document.querySelectorAll('.quiz-option')];
  const quizFeedback = document.getElementById('quizFeedback');
  quizButtons.forEach(button => {
    button.addEventListener('click', () => {
      const correct = button.dataset.answer === 'correct';
      quizButtons.forEach(b => { b.disabled = true; b.classList.remove('correct', 'wrong'); });
      button.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) quizButtons.find(b => b.dataset.answer === 'correct').classList.add('correct');
      quizFeedback.className = 'quiz-feedback ' + (correct ? 'success' : 'error');
      quizFeedback.textContent = correct ? 'إجابة صحيحة! النموذج يتعلّم بتحديث الأوزان لتقليل الخطأ. ✨' : 'قريبة، لكن الإجابة الصحيحة هي B: يحدّث النموذج أوزانه بناءً على الخطأ.';
    });
  });
  document.getElementById('retryQuizBtn').addEventListener('click', () => {
    quizButtons.forEach(button => { button.disabled = false; button.classList.remove('correct', 'wrong'); });
    quizFeedback.className = 'quiz-feedback';
    quizFeedback.textContent = 'اختر إجابتك 👆';
  });

  showSlide(0);
})();
