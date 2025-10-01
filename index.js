const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

const URL = 'https://m.hnair.com/cms/me/plus/info/202508/t20250808_78914.html';
const ORIGINAL_DIR = 'original';
const JSON_DIR = 'json';
const LAST_CONTENT_FILE = 'last_content.txt';

// 确保目录存在
async function ensureDirectories() {
  await fs.ensureDir(ORIGINAL_DIR);
  await fs.ensureDir(JSON_DIR);
}

// 获取当前日期字符串 (YYYYMMDD)
function getCurrentDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// 获取网页内容
async function fetchWebpage() {
  try {
    const response = await fetch(URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('获取网页失败:', error.message);
    throw error;
  }
}

// 提取biaotou文字
function extractBiaotouText(html) {
  const $ = cheerio.load(html);
  const biaotouText = $('.biaotou').text().trim();
  return biaotouText;
}

// 提取表格数据并转换为JSON
function extractTableToJson(html) {
  const $ = cheerio.load(html);
  const tables = [];
  
  $('table').each((index, table) => {
    const tableData = {
      index: index,
      tableName: '',
      headers: [],
      rows: []
    };
    
    // 先将第一行文本设置为表名
    const tableNameText = $(table).find('tr').first().text().trim();
    if (tableNameText) {
      tableData.tableName = tableNameText;
    }
    
    // 固定第二行作为表头
    const headerRow = $(table).find('tr').eq(1);
    headerRow.find('th, td').each((i, cell) => {
      tableData.headers.push($(cell).text().trim());
    });
    
    // 提取数据行（从第三行开始）
    $(table).find('tr').each((rowIndex, row) => {
      if (rowIndex <= 1) return; // 跳过前两行：第一行、第二行（第二行为表头）
      
      const rowData = {};
      $(row).find('td, th').each((cellIndex, cell) => {
        const headerName = tableData.headers[cellIndex] || `column_${cellIndex}`;
        rowData[headerName] = $(cell).text().trim();
      });
      
      // 只添加非空行
      if (Object.values(rowData).some(value => value !== '')) {
        tableData.rows.push(rowData);
      }
    });
    
    if (tableData.rows.length > 0) {
      tables.push(tableData);
    }
  });
  
  return {
    extractedAt: new Date().toISOString(),
    url: URL,
    tables: tables
  };
}

// 读取上次的内容
async function getLastContent() {
  try {
    if (await fs.pathExists(LAST_CONTENT_FILE)) {
      return await fs.readFile(LAST_CONTENT_FILE, 'utf8');
    }
  } catch (error) {
    console.log('读取上次内容失败，可能是首次运行');
  }
  return null;
}

// 保存当前内容
async function saveLastContent(content) {
  await fs.writeFile(LAST_CONTENT_FILE, content, 'utf8');
}

// 保存HTML文件
async function saveHtmlFile(html, dateString) {
  const filename = `${dateString}.html`;
  const filepath = path.join(ORIGINAL_DIR, filename);
  await fs.writeFile(filepath, html, 'utf8');
  console.log(`已保存HTML文件: ${filepath}`);
}

// 保存JSON文件
async function saveJsonFile(jsonData, dateString) {
  const filename = `${dateString}.json`;
  const filepath = path.join(JSON_DIR, filename);
  const latestPath = path.join(JSON_DIR, 'latest.json');
  
  // 保存日期命名的JSON文件
  await fs.writeFile(filepath, JSON.stringify(jsonData, null, 2), 'utf8');
  console.log(`已保存JSON文件: ${filepath}`);
  
  // 复制到latest.json
  await fs.copy(filepath, latestPath);
  console.log(`已更新latest.json文件`);
}

// 主函数
async function main() {
  try {
    console.log('开始监测网页变动...');
    
    // 确保目录存在
    await ensureDirectories();
    
    // 获取网页内容
    const html = await fetchWebpage();
    
    // 提取biaotou文字
    const currentBiaotouText = extractBiaotouText(html);
    console.log('当前biaotou文字:', currentBiaotouText);
    
    // 获取上次的内容
    const lastContent = await getLastContent();
    
    // 检查是否有变动
    if (lastContent === currentBiaotouText) {
      console.log('网页内容无变动，跳过处理');
      return;
    }
    
    console.log('检测到网页变动！');
    if (lastContent) {
      console.log('上次内容:', lastContent);
    }
    
    // 获取当前日期
    const dateString = getCurrentDateString();
    
    // 保存HTML文件
    await saveHtmlFile(html, dateString);
    
    // 提取表格并保存JSON
    const tableJson = extractTableToJson(html);
    await saveJsonFile(tableJson, dateString);
    
    // 保存当前内容作为下次比较的基准
    await saveLastContent(currentBiaotouText);
    
    console.log('处理完成！');
    
  } catch (error) {
    console.error('执行失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();