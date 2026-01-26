/**
 * MCP Feedback Collector - 前端應用
 */

// 狀態管理
const state = {
  sessionId: null,
  images: [],
  socket: null,
  connected: false
};

// DOM 元素
const elements = {
  workSummary: document.getElementById('work-summary'),
  feedbackText: document.getElementById('feedback-text'),
  dropZone: document.getElementById('drop-zone'),
  fileInput: document.getElementById('file-input'),
  imagePreview: document.getElementById('image-preview'),
  quickReplies: document.getElementById('quick-replies'),
  submitBtn: document.getElementById('submit-btn'),
  addReplyBtn: document.getElementById('add-reply-btn'),
  modal: document.getElementById('image-modal'),
  modalImage: document.getElementById('modal-image'),
  modalClose: document.getElementById('modal-close'),
  toast: document.getElementById('toast')
};

// 初始化
function init() {
  initSocket();
  initDropZone();
  initQuickReplies();
  initSubmitButton();
  initModal();
  initAddReplyButton();
  // 確保 DOM 完全載入後再載入罐頭語
  setTimeout(() => {
    loadQuickRepliesFromStorage();
  }, 0);
}

// 初始化 WebSocket 連接
function initSocket() {
  state.socket = io();

  state.socket.on('connect', () => {
    console.log('WebSocket 已連接');
    state.connected = true;
    state.socket.emit('request_session');
  });

  state.socket.on('disconnect', () => {
    console.log('WebSocket 已斷開');
    state.connected = false;
  });

  state.socket.on('session_assigned', (data) => {
    console.log('會話已分配:', data);
    state.sessionId = data.session_id;
    displayWorkSummary(data.work_summary);
  });

  state.socket.on('no_active_session', (data) => {
    console.log('無活躍會話:', data);
    elements.workSummary.innerHTML = '<div class="loading">等待 AI 工作彙報...</div>';
  });

  state.socket.on('work_summary_data', (data) => {
    displayWorkSummary(data.work_summary);
  });

  state.socket.on('feedback_submitted', (data) => {
    if (data.success) {
      showToast('反饋提交成功！', 'success');
      resetForm();
      
      // 延遲關閉網頁
      setTimeout(() => {
        window.close();
      }, 1000);
    }
  });

  state.socket.on('feedback_error', (data) => {
    showToast(data.error, 'error');
  });
}

// 顯示工作彙報
function displayWorkSummary(content) {
  if (!content) {
    elements.workSummary.innerHTML = '<div class="loading">等待 AI 工作彙報...</div>';
    return;
  }

  // 簡單的 Markdown 轉換
  let html = content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');

  elements.workSummary.innerHTML = html;
  
  // 自動 focus 在輸入框
  setTimeout(() => {
    elements.feedbackText.focus();
  }, 100);
}

// 初始化拖放區域
function initDropZone() {
  const dropZone = elements.dropZone;
  const fileInput = elements.fileInput;

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
  });
}

// 處理檔案
function handleFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      showToast('只支援圖片檔案', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: e.target.result
      };
      state.images.push(imageData);
      renderImagePreviews();
    };
    reader.readAsDataURL(file);
  });
}

// 渲染圖片預覽
function renderImagePreviews() {
  elements.imagePreview.innerHTML = '';

  state.images.forEach((img, index) => {
    const item = document.createElement('div');
    item.className = 'preview-item';
    item.draggable = true;
    item.dataset.index = index;

    item.innerHTML = `
      <img src="${img.data}" alt="${img.name}">
      <button class="remove-btn" data-index="${index}">&times;</button>
    `;

    // 點擊圖片開啟彈窗
    item.querySelector('img').addEventListener('click', () => openModal(img.data));

    // 移除按鈕
    item.querySelector('.remove-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      removeImage(index);
    });

    // 拖動排序
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);

    elements.imagePreview.appendChild(item);
  });
}

// 移除圖片
function removeImage(index) {
  state.images.splice(index, 1);
  renderImagePreviews();
}

// 拖動排序處理
let draggedIndex = null;
let draggedItem = null;

function handleDragStart(e) {
  const previewItem = e.target.closest('.preview-item');
  draggedIndex = parseInt(previewItem.dataset.index);
  draggedItem = state.images[draggedIndex];
  previewItem.classList.add('dragging');
}

function handleDragEnd(e) {
  e.target.closest('.preview-item').classList.remove('dragging');
  draggedIndex = null;
  draggedItem = null;
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  const dropTarget = e.target.closest('.preview-item');
  
  if (!dropTarget || draggedIndex === null) return;
  
  const dropIndex = parseInt(dropTarget.dataset.index);

  if (draggedIndex !== dropIndex && draggedItem) {
    // 創建新的圖片陣列
    const newImages = [...state.images];
    
    // 移除拖動的項目
    newImages.splice(draggedIndex, 1);
    
    // 重新計算插入位置（因為移除後索引可能改變）
    const newDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    
    // 插入到新位置
    newImages.splice(newDropIndex, 0, draggedItem);
    
    // 更新狀態
    state.images = newImages;
    renderImagePreviews();
  }
}

// 初始化罐頭語按鈕
function initQuickReplies() {
  elements.quickReplies.addEventListener('click', (e) => {
    if (e.target.classList.contains('quick-reply-btn')) {
      const text = e.target.dataset.text;
      // 將文字帶入輸入框，不直接提交
      elements.feedbackText.value = text;
      elements.feedbackText.focus();
    }
  });

  // 雙擊編輯罐頭語
  elements.quickReplies.addEventListener('dblclick', (e) => {
    if (e.target.classList.contains('quick-reply-btn')) {
      editQuickReply(e.target);
    }
  });
}

// 初始化新增罐頭語按鈕
function initAddReplyButton() {
  elements.addReplyBtn.addEventListener('click', () => {
    addNewQuickReply();
  });
}

// 編輯罐頭語
function editQuickReply(btn) {
  const originalText = btn.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = originalText;
  input.className = 'quick-reply-input';
  input.style.cssText = 'padding: 8px; border-radius: 16px; border: 1px solid var(--accent); background: var(--bg-secondary); color: var(--text-primary); font-size: 13px; width: 120px;';

  btn.replaceWith(input);
  input.focus();
  input.select();

  let isSaving = false; // 防止重複保存

  const save = () => {
    if (isSaving) return; // 防止重複執行
    isSaving = true;
    
    const newText = input.value.trim() || originalText;
    const newBtn = createQuickReplyButton(newText, newText === '無' ? '' : newText);
    input.replaceWith(newBtn);
    saveQuickRepliesToStorage();
    
    // 重置保存狀態
    setTimeout(() => {
      isSaving = false;
    }, 100);
  };

  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 防止其他事件
      save();
    } else if (e.key === 'Escape') {
      const newBtn = createQuickReplyButton(originalText, originalText === '無' ? '' : originalText);
      input.replaceWith(newBtn);
    }
  });
}

// 新增罐頭語
function addNewQuickReply() {
  // 檢查是否已經有輸入框
  if (elements.quickReplies.querySelector('.quick-reply-input')) {
    return;
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = '輸入新的罐頭語';
  input.className = 'quick-reply-input';
  input.style.cssText = 'padding: 8px; border-radius: 16px; border: 1px solid var(--accent); background: var(--bg-secondary); color: var(--text-primary); font-size: 13px; width: 150px;';

  // 在新增按鈕前插入輸入框
  elements.addReplyBtn.parentNode.insertBefore(input, elements.addReplyBtn);
  input.focus();

  let isSaving = false; // 防止重複保存

  const save = () => {
    if (isSaving) return; // 防止重複執行
    isSaving = true;
    
    const newText = input.value.trim();
    if (newText) {
      // 檢查是否已存在相同的罐頭語
      const existingBtns = elements.quickReplies.querySelectorAll('.quick-reply-btn');
      const exists = Array.from(existingBtns).some(btn => btn.dataset.text === newText);
      
      if (!exists) {
        // 創建新的按鈕（會自動插入到新增按鈕之前）
        createQuickReplyButton(newText, newText);
        
        // 儲存到 localStorage
        saveQuickRepliesToStorage();
        
        showToast('罐頭語已新增', 'success');
      } else {
        showToast('罐頭語已存在', 'error');
      }
    }
    
    // 移除輸入框
    input.remove();
    
    // 重置保存狀態
    setTimeout(() => {
      isSaving = false;
    }, 100);
  };

  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 防止其他事件
      save();
    } else if (e.key === 'Escape') {
      input.remove();
    }
  });
}

// 儲存罐頭語到後端 API
async function saveQuickRepliesToStorage() {
  const buttons = elements.quickReplies.querySelectorAll('.quick-reply-btn');
  const replies = Array.from(buttons).map(btn => ({
    text: btn.querySelector('span')?.textContent || btn.textContent,
    value: btn.dataset.text
  }));
  
  try {
    await fetch('/api/quick-replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replies })
    });
  } catch (error) {
    console.error('儲存罐頭語失敗:', error);
  }
  
  // 確保新增按鈕始終可見
  ensureAddButtonVisible();
}

// 確保新增按鈕可見
function ensureAddButtonVisible() {
  if (!elements.quickReplies.contains(elements.addReplyBtn)) {
    elements.quickReplies.appendChild(elements.addReplyBtn);
  }
}

// 從後端 API 載入罐頭語
async function loadQuickRepliesFromStorage() {
  try {
    const response = await fetch('/api/quick-replies');
    const data = await response.json();
    
    if (data.success && Array.isArray(data.replies)) {
      elements.quickReplies.innerHTML = '';
      data.replies.forEach(reply => {
        createQuickReplyButton(reply.text, reply.value);
      });
    }
  } catch (error) {
    console.error('載入罐頭語失敗:', error);
  }
  
  // 確保新增按鈕始終存在
  ensureAddButtonVisible();
}

// 創建罐頭語按鈕
function createQuickReplyButton(text, value) {
  const btn = document.createElement('button');
  btn.className = 'quick-reply-btn';
  btn.dataset.text = value;
  
  // 創建文字 span
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  textSpan.style.pointerEvents = 'none'; // 防止文字影響點擊事件
  
  // 添加刪除按鈕
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '×';
  deleteBtn.title = '刪除罐頭語';
  deleteBtn.setAttribute('aria-label', '刪除罐頭語');
  
  // 刪除事件
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm(`確定要刪除罐頭語「${text}」嗎？`)) {
      btn.remove();
      saveQuickRepliesToStorage();
      showToast('罐頭語已刪除', 'success');
    }
  });
  
  // 組裝按鈕結構
  btn.appendChild(textSpan);
  btn.appendChild(deleteBtn);
  
  // 安全地插入按鈕
  try {
    if (elements.addReplyBtn && elements.quickReplies.contains(elements.addReplyBtn)) {
      elements.quickReplies.insertBefore(btn, elements.addReplyBtn);
    } else {
      elements.quickReplies.appendChild(btn);
    }
  } catch (error) {
    console.error('插入罐頭語按鈕失敗:', error);
    elements.quickReplies.appendChild(btn);
  }
  
  return btn;
}

// 初始化提交按鈕
function initSubmitButton() {
  elements.submitBtn.addEventListener('click', submitFeedback);
}

// 快速提交罐頭語
function submitQuickReply(text) {
  if (!state.sessionId) {
    showToast('無活躍會話，請等待 AI 調用', 'error');
    return;
  }

  const feedbackData = {
    sessionId: state.sessionId,
    text: text,
    images: [],
    timestamp: Date.now()
  };

  state.socket.emit('submit_feedback', feedbackData);
}

// 提交反饋
function submitFeedback() {
  const text = elements.feedbackText.value.trim();
  const images = state.images;

  if (!text && images.length === 0) {
    showToast('請輸入反饋或上傳圖片', 'error');
    return;
  }

  if (!state.sessionId) {
    showToast('無活躍會話，請等待 AI 調用', 'error');
    return;
  }

  const feedbackData = {
    sessionId: state.sessionId,
    text: text,
    images: images.map(img => ({
      name: img.name,
      type: img.type,
      size: img.size,
      data: img.data
    })),
    timestamp: Date.now()
  };

  elements.submitBtn.disabled = true;
  state.socket.emit('submit_feedback', feedbackData);

  setTimeout(() => {
    elements.submitBtn.disabled = false;
  }, 2000);
}

// 重置表單
function resetForm() {
  elements.feedbackText.value = '';
  state.images = [];
  renderImagePreviews();
  state.sessionId = null;
  elements.workSummary.innerHTML = '<div class="loading">等待 AI 工作彙報...</div>';
}

// 初始化圖片彈窗
function initModal() {
  elements.modalClose.addEventListener('click', closeModal);
  elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.modal.classList.contains('show')) {
      closeModal();
    }
  });
}

// 開啟彈窗
function openModal(imageSrc) {
  elements.modalImage.src = imageSrc;
  elements.modal.classList.add('show');
}

// 關閉彈窗
function closeModal() {
  elements.modal.classList.remove('show');
  elements.modalImage.src = '';
}

// 顯示 Toast 提示
function showToast(message, type = 'info') {
  elements.toast.textContent = message;
  elements.toast.className = 'toast show ' + type;

  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', init);
