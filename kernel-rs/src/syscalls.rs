use core::slice;
extern "C" {
    fn log_message(ptr: *const u8, len: usize);
    fn file_read(ptr: *const u8, len: usize) -> u64;
}

pub fn log(msg: &str) {
    unsafe { log_message(msg.as_ptr(), msg.len()) };
}

pub fn read_file_from_host(path: &str) -> Result<String, String> {
    let res = unsafe { file_read(path.as_ptr(), path.len()) };
    if res == 0 {
        return Err(format!("failed to read: {}", path));
    }
    let ptr = (res >> 32) as *const u8;
    let len = (res & 0xFFFF_FFFF) as usize;
    let data = unsafe { slice::from_raw_parts(ptr, len) };
    Ok(String::from_utf8_lossy(data).into())
}
