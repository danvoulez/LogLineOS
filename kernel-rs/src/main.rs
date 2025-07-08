use std::{env, slice};
use serde_yaml::Value;
use std::collections::HashMap;

mod contract_executor;
mod syscalls;

#[no_mangle]
pub extern "C" fn allocate_buffer(size: usize) -> *mut u8 {
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    ptr
}

fn main() {
    syscalls::log("kernel online");

    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        syscalls::log("bootstrap path missing");
        return;
    }
    let bootstrap_path = &args[1];

    let content = match syscalls::read_file_from_host(bootstrap_path) {
        Ok(c) => c,
        Err(e) => {
            syscalls::log(&e);
            return;
        }
    };

    let contracts: Vec<HashMap<String, Value>> = serde_yaml::from_str(&content).expect("parse bootstrap");
    syscalls::log(&format!("loaded {} contracts", contracts.len()));

    // Example: just log the type of each contract
    for c in contracts.iter() {
        if let Some(t) = c.get("type").and_then(|v| v.as_str()) {
            syscalls::log(&format!("contract: {}", t));
        }
    }
}
