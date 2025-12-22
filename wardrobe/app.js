// 数据存储管理
class WardrobeStorage {
    constructor() {
        this.itemsKey = 'wardrobe_items';
        this.purchasesKey = 'wardrobe_purchases';
        this.styleKey = 'wardrobe_style';
    }

    getItems() {
        const items = localStorage.getItem(this.itemsKey);
        return items ? JSON.parse(items) : [];
    }

    saveItems(items) {
        localStorage.setItem(this.itemsKey, JSON.stringify(items));
    }

    getPurchases() {
        const purchases = localStorage.getItem(this.purchasesKey);
        return purchases ? JSON.parse(purchases) : [];
    }

    savePurchases(purchases) {
        localStorage.setItem(this.purchasesKey, JSON.stringify(purchases));
    }

    getStyle() {
        const style = localStorage.getItem(this.styleKey);
        return style ? JSON.parse(style) : { preferredStyles: [], colorPreference: '' };
    }

    saveStyle(style) {
        localStorage.setItem(this.styleKey, JSON.stringify(style));
    }
}

// 图像分析类
class ImageAnalyzer {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    // 分析图像并提取信息
    async analyzeImage(imageData) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                this.ctx.drawImage(img, 0, 0);
                
                const analysis = {
                    dominantColor: this.getDominantColor(),
                    category: this.analyzeCategory(img),
                    style: this.analyzeStyle(img),
                    brand: null // 品牌识别需要更复杂的AI，这里留空
                };
                
                resolve(analysis);
            };
            img.src = imageData;
        });
    }

    // 获取主要颜色
    getDominantColor() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const colorCount = {};
        
        // 采样分析（每10个像素采样一次以提高性能）
        for (let i = 0; i < data.length; i += 40) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // 转换为颜色名称
            const colorName = this.rgbToColorName(r, g, b);
            colorCount[colorName] = (colorCount[colorName] || 0) + 1;
        }
        
        // 返回最常见的颜色
        return Object.keys(colorCount).reduce((a, b) => 
            colorCount[a] > colorCount[b] ? a : b
        );
    }

    // RGB转颜色名称
    rgbToColorName(r, g, b) {
        // 计算亮度
        const brightness = (r + g + b) / 3;
        
        // 判断主要色相
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        
        if (brightness < 50) return '黑色';
        if (brightness > 200) return '白色';
        if (diff < 30) return brightness > 150 ? '浅灰' : '深灰';
        
        if (r > g && r > b) {
            if (r - g > 50 && r - b > 50) return '红色';
            if (r - g < 30) return '橙色';
            return '红色';
        }
        if (g > r && g > b) {
            if (g - r > 50 && g - b > 50) return '绿色';
            return '绿色';
        }
        if (b > r && b > g) {
            if (b - r > 50 && b - g > 50) return '蓝色';
            return '蓝色';
        }
        
        return '其他';
    }

    // 分析类别（基于图像特征）
    analyzeCategory(img) {
        const aspectRatio = img.width / img.height;
        const area = img.width * img.height;
        
        // 简单的启发式规则
        if (aspectRatio > 1.5) {
            return '下装'; // 长条形可能是裤子
        } else if (aspectRatio < 0.7) {
            return '外套'; // 高而窄可能是外套
        } else if (area < 50000) {
            return '配饰'; // 小面积可能是配饰
        } else {
            return '上衣'; // 默认上衣
        }
    }

    // 分析风格
    analyzeStyle(img) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        let colorVariety = 0;
        const colors = new Set();
        
        // 采样分析颜色种类
        for (let i = 0; i < data.length; i += 40) {
            const r = Math.floor(data[i] / 32) * 32;
            const g = Math.floor(data[i + 1] / 32) * 32;
            const b = Math.floor(data[i + 2] / 32) * 32;
            colors.add(`${r},${g},${b}`);
        }
        
        colorVariety = colors.size;
        
        const styles = [];
        
        // 根据颜色种类判断风格
        if (colorVariety < 5) {
            styles.push('简约');
        }
        if (colorVariety > 15) {
            styles.push('时尚');
        }
        
        // 默认添加休闲风格
        if (styles.length === 0) {
            styles.push('休闲');
        }
        
        return styles;
    }
}

// 应用主类
class WardrobeApp {
    constructor() {
        this.storage = new WardrobeStorage();
        this.items = this.storage.getItems();
        this.purchases = this.storage.getPurchases();
        this.style = this.storage.getStyle();
        this.analyzer = new ImageAnalyzer();
        this.stream = null;
        this.currentFacingMode = 'environment'; // 后置摄像头
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadWardrobe();
        this.loadPurchases();
        this.loadStylePreferences();
        this.setupPhotoPreview();
        this.setupCamera();
    }

    setupEventListeners() {
        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // 添加衣物表单
        document.getElementById('addItemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addItem();
        });

        // 筛选器
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.loadWardrobe();
        });
        document.getElementById('seasonFilter').addEventListener('change', () => {
            this.loadWardrobe();
        });

        // 购买记录
        document.getElementById('addPurchaseBtn').addEventListener('click', () => {
            this.openPurchaseModal();
        });
        document.getElementById('purchaseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPurchase();
        });

        // 保存风格偏好
        document.getElementById('saveStyleBtn').addEventListener('click', () => {
            this.saveStylePreferences();
        });

        // 获取推荐
        document.getElementById('getRecommendationBtn').addEventListener('click', () => {
            this.getRecommendation();
        });

        // 拍照按钮
        document.getElementById('cameraBtn').addEventListener('click', () => {
            this.openCamera();
        });

        // 拍照相关按钮
        document.getElementById('captureBtn').addEventListener('click', () => {
            this.capturePhoto();
        });
        document.getElementById('switchCameraBtn').addEventListener('click', () => {
            this.switchCamera();
        });
        document.getElementById('cancelCameraBtn').addEventListener('click', () => {
            this.closeCamera();
        });
        document.getElementById('closeCamera').addEventListener('click', () => {
            this.closeCamera();
        });
        document.getElementById('retakeBtn').addEventListener('click', () => {
            this.retakePhoto();
        });
        document.getElementById('usePhotoBtn').addEventListener('click', () => {
            this.usePhoto();
        });

        // 模态框关闭
        document.querySelector('.close').addEventListener('click', () => {
            this.closePurchaseModal();
        });
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('purchaseModal');
            if (e.target === modal) {
                this.closePurchaseModal();
            }
            const cameraModal = document.getElementById('cameraModal');
            if (e.target === cameraModal) {
                this.closeCamera();
            }
        });
    }

    switchTab(tabName) {
        // 更新按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // 特殊处理
        if (tabName === 'purchase') {
            this.updatePurchaseItemSelect();
        }
    }

    setupPhotoPreview() {
        const photoInput = document.getElementById('itemPhoto');
        const preview = document.getElementById('photoPreview');
        
        photoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const imageData = e.target.result;
                    preview.innerHTML = `<img src="${imageData}" alt="预览">`;
                    
                    // 自动分析上传的图片
                    try {
                        const analysis = await this.analyzer.analyzeImage(imageData);
                        
                        // 自动填充表单（如果字段为空）
                        if (!document.getElementById('itemColor').value && analysis.dominantColor) {
                            document.getElementById('itemColor').value = analysis.dominantColor;
                        }
                        
                        if (!document.getElementById('itemCategory').value && analysis.category) {
                            document.getElementById('itemCategory').value = analysis.category;
                        }
                        
                        if (analysis.style && analysis.style.length > 0) {
                            analysis.style.forEach(style => {
                                const checkbox = Array.from(document.querySelectorAll('#add-item .style-tags input[type="checkbox"]'))
                                    .find(cb => cb.value === style);
                                if (checkbox && !checkbox.checked) {
                                    checkbox.checked = true;
                                }
                            });
                        }
                        
                        if (!document.getElementById('itemName').value) {
                            const category = analysis.category || '衣物';
                            const color = analysis.dominantColor || '';
                            document.getElementById('itemName').value = `${color}${category}`.trim() || '新衣物';
                        }
                    } catch (error) {
                        console.error('分析失败:', error);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    setupCamera() {
        // 检查浏览器是否支持摄像头
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            const cameraBtn = document.getElementById('cameraBtn');
            if (cameraBtn) {
                cameraBtn.style.display = 'none';
            }
        }
    }

    addItem() {
        const form = document.getElementById('addItemForm');
        const formData = new FormData(form);
        
        const name = document.getElementById('itemName').value;
        const category = document.getElementById('itemCategory').value;
        const color = document.getElementById('itemColor').value;
        const brand = document.getElementById('itemBrand').value;
        const season = document.getElementById('itemSeason').value;
        const notes = document.getElementById('itemNotes').value;
        
        // 获取选中的风格标签
        const styleTags = Array.from(document.querySelectorAll('#add-item .style-tags input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        
        // 处理照片
        const photoInput = document.getElementById('itemPhoto');
        let photoData = this.capturedPhotoData || null;
        
        if (photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoData = e.target.result;
                this.saveItemToStorage(name, category, color, brand, season, styleTags, photoData, notes);
            };
            reader.readAsDataURL(photoInput.files[0]);
        } else if (photoData) {
            this.saveItemToStorage(name, category, color, brand, season, styleTags, photoData, notes);
        } else {
            this.saveItemToStorage(name, category, color, brand, season, styleTags, null, notes);
        }
        
        // 清除拍照数据
        this.capturedPhotoData = null;
        this.currentPhotoAnalysis = null;
    }

    saveItemToStorage(name, category, color, brand, season, styleTags, photoData, notes) {
        const newItem = {
            id: Date.now().toString(),
            name,
            category,
            color,
            brand,
            season,
            styleTags,
            photo: photoData,
            notes,
            dateAdded: new Date().toISOString()
        };

        this.items.push(newItem);
        this.storage.saveItems(this.items);
        
        // 重置表单
        document.getElementById('addItemForm').reset();
        document.getElementById('photoPreview').innerHTML = '';
        
        // 切换到衣橱页面
        this.switchTab('wardrobe');
        this.loadWardrobe();
        
        alert('衣物添加成功！');
    }

    loadWardrobe() {
        const grid = document.getElementById('wardrobeGrid');
        const categoryFilter = document.getElementById('categoryFilter').value;
        const seasonFilter = document.getElementById('seasonFilter').value;

        let filteredItems = this.items;

        if (categoryFilter) {
            filteredItems = filteredItems.filter(item => item.category === categoryFilter);
        }

        if (seasonFilter) {
            filteredItems = filteredItems.filter(item => 
                item.season === seasonFilter || item.season === '四季'
            );
        }

        if (filteredItems.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">👔</div>
                    <div class="empty-state-text">暂无衣物，快去添加吧！</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredItems.map(item => `
            <div class="item-card" data-id="${item.id}">
                ${item.photo ? 
                    `<img src="${item.photo}" alt="${item.name}" class="item-card-image">` :
                    `<div class="item-card-placeholder">👔</div>`
                }
                <div class="item-card-info">
                    <h3>${item.name}</h3>
                    <p><strong>类别:</strong> ${item.category}</p>
                    ${item.color ? `<p><strong>颜色:</strong> ${item.color}</p>` : ''}
                    ${item.brand ? `<p><strong>品牌:</strong> ${item.brand}</p>` : ''}
                    <p><strong>季节:</strong> ${item.season}</p>
                    ${item.styleTags && item.styleTags.length > 0 ? `
                        <div class="item-tags">
                            ${item.styleTags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // 添加删除功能
        grid.querySelectorAll('.item-card').forEach(card => {
            card.addEventListener('dblclick', (e) => {
                if (confirm('确定要删除这件衣物吗？')) {
                    const id = card.dataset.id;
                    this.deleteItem(id);
                }
            });
        });
    }

    deleteItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.storage.saveItems(this.items);
        this.loadWardrobe();
    }

    loadPurchases() {
        const list = document.getElementById('purchaseList');
        
        if (this.purchases.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🛍️</div>
                    <div class="empty-state-text">暂无购买记录</div>
                </div>
            `;
            return;
        }

        // 按日期排序（最新的在前）
        const sortedPurchases = [...this.purchases].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        list.innerHTML = sortedPurchases.map(purchase => {
            const item = this.items.find(i => i.id === purchase.itemId);
            const itemName = item ? item.name : '未知衣物';
            const date = new Date(purchase.date).toLocaleDateString('zh-CN');
            
            return `
                <div class="purchase-item">
                    <div class="purchase-item-header">
                        <h3>${itemName}</h3>
                        <div class="purchase-item-price">¥${purchase.price.toFixed(2)}</div>
                    </div>
                    <div class="purchase-item-details">
                        <p><strong>购买日期:</strong> ${date}</p>
                        ${purchase.store ? `<p><strong>购买地点:</strong> ${purchase.store}</p>` : ''}
                        ${purchase.notes ? `<p><strong>备注:</strong> ${purchase.notes}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    openPurchaseModal() {
        document.getElementById('purchaseModal').style.display = 'block';
        this.updatePurchaseItemSelect();
        // 设置默认日期为今天
        document.getElementById('purchaseDate').valueAsDate = new Date();
    }

    closePurchaseModal() {
        document.getElementById('purchaseModal').style.display = 'none';
        document.getElementById('purchaseForm').reset();
    }

    updatePurchaseItemSelect() {
        const select = document.getElementById('purchaseItem');
        select.innerHTML = '<option value="">选择衣物</option>' +
            this.items.map(item => 
                `<option value="${item.id}">${item.name} (${item.category})</option>`
            ).join('');
    }

    addPurchase() {
        const itemId = document.getElementById('purchaseItem').value;
        const date = document.getElementById('purchaseDate').value;
        const price = parseFloat(document.getElementById('purchasePrice').value);
        const store = document.getElementById('purchaseStore').value;
        const notes = document.getElementById('purchaseNotes').value;

        if (!itemId || !date || !price) {
            alert('请填写必填项！');
            return;
        }

        const newPurchase = {
            id: Date.now().toString(),
            itemId,
            date,
            price,
            store,
            notes
        };

        this.purchases.push(newPurchase);
        this.storage.savePurchases(this.purchases);
        
        this.closePurchaseModal();
        this.loadPurchases();
        alert('购买记录添加成功！');
    }

    loadStylePreferences() {
        const preferredStyles = this.style.preferredStyles || [];
        const colorPreference = this.style.colorPreference || '';

        // 设置复选框
        document.querySelectorAll('#style input[name="preferredStyle"]').forEach(checkbox => {
            checkbox.checked = preferredStyles.includes(checkbox.value);
        });

        // 设置颜色偏好
        document.getElementById('colorPreference').value = colorPreference;
    }

    saveStylePreferences() {
        const preferredStyles = Array.from(
            document.querySelectorAll('#style input[name="preferredStyle"]:checked')
        ).map(cb => cb.value);
        
        const colorPreference = document.getElementById('colorPreference').value;

        this.style = {
            preferredStyles,
            colorPreference
        };

        this.storage.saveStyle(this.style);
        alert('风格偏好已保存！');
    }

    getRecommendation() {
        const weather = document.getElementById('currentWeather').value;
        const season = document.getElementById('currentSeason').value;
        const temp = parseFloat(document.getElementById('currentTemp').value) || 20;

        const resultDiv = document.getElementById('recommendationResult');
        
        if (this.items.length === 0) {
            resultDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👔</div>
                    <div class="empty-state-text">请先添加一些衣物到衣橱</div>
                </div>
            `;
            return;
        }

        // 根据季节和温度筛选
        let suitableItems = this.items.filter(item => {
            if (item.season === '四季') return true;
            if (item.season === season) return true;
            return false;
        });

        // 根据温度进一步筛选
        if (temp < 10) {
            // 冬天 - 优先外套、长袖
            suitableItems = suitableItems.filter(item => 
                item.category === '外套' || 
                (item.category === '上衣' && !item.styleTags?.includes('短袖'))
            );
        } else if (temp < 20) {
            // 春秋 - 适中
            suitableItems = suitableItems.filter(item => 
                item.season !== '夏'
            );
        } else {
            // 夏天 - 避免外套
            suitableItems = suitableItems.filter(item => 
                item.category !== '外套' && item.season !== '冬'
            );
        }

        // 根据用户风格偏好筛选
        if (this.style.preferredStyles && this.style.preferredStyles.length > 0) {
            suitableItems = suitableItems.filter(item => {
                if (!item.styleTags || item.styleTags.length === 0) return true;
                return item.styleTags.some(tag => 
                    this.style.preferredStyles.includes(tag)
                );
            });
        }

        // 根据颜色偏好（如果有）
        if (this.style.colorPreference) {
            const preferredColors = this.style.colorPreference.split(/[，,、]/).map(c => c.trim());
            suitableItems.sort((a, b) => {
                const aMatch = a.color && preferredColors.some(c => a.color.includes(c));
                const bMatch = b.color && preferredColors.some(c => b.color.includes(c));
                return bMatch - aMatch;
            });
        }

        if (suitableItems.length === 0) {
            resultDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">😔</div>
                    <div class="empty-state-text">没有找到合适的衣物，请添加更多衣物或调整筛选条件</div>
                </div>
            `;
            return;
        }

        // 推荐搭配
        const tops = suitableItems.filter(item => item.category === '上衣');
        const bottoms = suitableItems.filter(item => item.category === '下装');
        const outerwears = suitableItems.filter(item => item.category === '外套');
        const shoes = suitableItems.filter(item => item.category === '鞋子');
        const accessories = suitableItems.filter(item => item.category === '配饰');

        // 生成推荐
        const recommendations = [];
        
        // 推荐1：基础搭配
        if (tops.length > 0 && bottoms.length > 0) {
            const top = this.getRandomItem(tops);
            const bottom = this.getRandomItem(bottoms);
            const shoe = shoes.length > 0 ? this.getRandomItem(shoes) : null;
            const accessory = accessories.length > 0 ? this.getRandomItem(accessories) : null;
            
            recommendations.push({
                title: '基础搭配',
                items: [top, bottom, shoe, accessory].filter(Boolean)
            });
        }

        // 推荐2：完整搭配（如果有外套）
        if (outerwears.length > 0 && tops.length > 0 && bottoms.length > 0) {
            const outerwear = this.getRandomItem(outerwears);
            const top = this.getRandomItem(tops);
            const bottom = this.getRandomItem(bottoms);
            const shoe = shoes.length > 0 ? this.getRandomItem(shoes) : null;
            
            recommendations.push({
                title: '完整搭配',
                items: [outerwear, top, bottom, shoe].filter(Boolean)
            });
        }

        // 如果没有完整搭配，至少推荐单品
        if (recommendations.length === 0) {
            recommendations.push({
                title: '单品推荐',
                items: suitableItems.slice(0, 4)
            });
        }

        // 显示推荐
        resultDiv.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <h3>${rec.title}</h3>
                <div class="recommendation-items">
                    ${rec.items.map(item => `
                        <div class="recommendation-item">
                            <h4>${item.name}</h4>
                            <p>${item.category}</p>
                            ${item.color ? `<p>颜色: ${item.color}</p>` : ''}
                            ${item.photo ? 
                                `<img src="${item.photo}" alt="${item.name}">` :
                                '<div style="width:100%;height:150px;background:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#667eea;font-size:48px;">👔</div>'
                            }
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    getRandomItem(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    // 打开摄像头
    async openCamera() {
        const modal = document.getElementById('cameraModal');
        const video = document.getElementById('cameraVideo');
        const container = document.getElementById('cameraContainer');
        const preview = document.getElementById('cameraPreview');
        
        modal.style.display = 'block';
        container.style.display = 'flex';
        preview.style.display = 'none';
        
        try {
            // 检查是否支持摄像头
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('您的浏览器不支持摄像头功能');
            }
            
            const constraints = {
                video: {
                    facingMode: this.currentFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = this.stream;
            
            // 等待视频加载
            video.onloadedmetadata = () => {
                video.play();
            };
        } catch (error) {
            console.error('无法访问摄像头:', error);
            let errorMsg = '无法访问摄像头';
            if (error.name === 'NotAllowedError') {
                errorMsg = '请允许访问摄像头权限';
            } else if (error.name === 'NotFoundError') {
                errorMsg = '未找到摄像头设备';
            } else if (error.name === 'NotReadableError') {
                errorMsg = '摄像头被其他应用占用';
            }
            alert(errorMsg);
            this.closeCamera();
        }
    }

    // 关闭摄像头
    closeCamera() {
        const modal = document.getElementById('cameraModal');
        const video = document.getElementById('cameraVideo');
        const container = document.getElementById('cameraContainer');
        const preview = document.getElementById('cameraPreview');
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        video.srcObject = null;
        modal.style.display = 'none';
        container.style.display = 'flex';
        preview.style.display = 'none';
    }

    // 切换前后摄像头
    async switchCamera() {
        this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
        this.closeCamera();
        await this.openCamera();
    }

    // 拍照
    capturePhoto() {
        const video = document.getElementById('cameraVideo');
        const canvas = document.getElementById('cameraCanvas');
        const container = document.getElementById('cameraContainer');
        const preview = document.getElementById('cameraPreview');
        const capturedImage = document.getElementById('capturedImage');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        capturedImage.src = imageData;
        
        // 停止视频流
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        container.style.display = 'none';
        preview.style.display = 'flex';
        
        // 开始分析
        this.analyzePhoto(imageData);
    }

    // 分析照片
    async analyzePhoto(imageData) {
        const loading = document.getElementById('analysisLoading');
        const result = document.getElementById('analysisResult');
        
        loading.style.display = 'block';
        result.style.display = 'none';
        
        try {
            const analysis = await this.analyzer.analyzeImage(imageData);
            
            loading.style.display = 'none';
            result.style.display = 'block';
            
            // 显示分析结果
            result.innerHTML = `
                <h4>📊 分析结果</h4>
                <p><strong>主要颜色:</strong> <span class="suggestion">${analysis.dominantColor}</span></p>
                <p><strong>建议类别:</strong> <span class="suggestion">${analysis.category}</span></p>
                <p><strong>建议风格:</strong> ${analysis.style.map(s => `<span class="suggestion">${s}</span>`).join(' ')}</p>
            `;
            
            // 保存分析结果供后续使用
            this.currentPhotoAnalysis = {
                imageData,
                analysis
            };
        } catch (error) {
            console.error('分析失败:', error);
            loading.style.display = 'none';
            result.innerHTML = '<p style="color: #ff4757;">分析失败，请重试</p>';
        }
    }

    // 重拍
    retakePhoto() {
        const container = document.getElementById('cameraContainer');
        const preview = document.getElementById('cameraPreview');
        
        container.style.display = 'flex';
        preview.style.display = 'none';
        
        // 重新打开摄像头
        this.openCamera();
    }

    // 使用照片
    usePhoto() {
        if (!this.currentPhotoAnalysis) return;
        
        const { imageData, analysis } = this.currentPhotoAnalysis;
        
        // 填充表单
        if (analysis.dominantColor) {
            document.getElementById('itemColor').value = analysis.dominantColor;
        }
        
        if (analysis.category) {
            document.getElementById('itemCategory').value = analysis.category;
        }
        
        if (analysis.style && analysis.style.length > 0) {
            // 选中对应的风格标签
            analysis.style.forEach(style => {
                const checkbox = Array.from(document.querySelectorAll('#add-item .style-tags input[type="checkbox"]'))
                    .find(cb => cb.value === style);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        
        // 设置照片预览
        const preview = document.getElementById('photoPreview');
        preview.innerHTML = `<img src="${imageData}" alt="拍摄的照片">`;
        
        // 保存照片数据
        this.capturedPhotoData = imageData;
        
        // 关闭摄像头模态框
        this.closeCamera();
        
        // 切换到添加衣物页面
        this.switchTab('add-item');
        
        // 自动生成名称
        if (!document.getElementById('itemName').value) {
            const category = analysis.category || '衣物';
            const color = analysis.dominantColor || '';
            document.getElementById('itemName').value = `${color}${category}`.trim() || '新衣物';
        }
        
        // 自动设置季节（根据当前月份）
        const month = new Date().getMonth() + 1;
        let season = '四季';
        if (month >= 3 && month <= 5) season = '春';
        else if (month >= 6 && month <= 8) season = '夏';
        else if (month >= 9 && month <= 11) season = '秋';
        else season = '冬';
        
        if (!document.getElementById('itemSeason').value) {
            document.getElementById('itemSeason').value = season;
        }
        
        // 提示用户检查信息
        setTimeout(() => {
            alert('已自动填充信息，请检查并完善后保存');
        }, 300);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new WardrobeApp();
});


